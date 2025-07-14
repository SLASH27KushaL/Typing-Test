// Type.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  LinearProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Fade
} from '@mui/material';
import {
  RestartAlt,
  Speed,
  CheckCircle,
  Timer,
  ErrorOutline
} from '@mui/icons-material';

// — restored full word list here —
const SAMPLE_WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'and', 'runs',
  'through', 'forest', 'while', 'birds', 'sing', 'songs', 'above', 'trees', 'where',
  'sunlight', 'filters', 'down', 'creating', 'beautiful', 'patterns', 'on', 'ground',
  'beneath', 'their', 'feet', 'as', 'they', 'continue', 'journey', 'toward', 'distant',
  'mountains', 'that', 'rise', 'majestically', 'against', 'clear', 'blue', 'sky',
  'with', 'white', 'clouds', 'drifting', 'slowly', 'across', 'horizon', 'like',
  'ships', 'sailing', 'through', 'ocean', 'of', 'dreams', 'and', 'memories',
  'from', 'past', 'adventures', 'shared', 'with', 'friends', 'who', 'laugh',
  'together', 'around', 'campfire', 'under', 'starry', 'night', 'telling',
  'stories', 'about', 'brave', 'heroes', 'magical', 'creatures', 'ancient',
  'wisdom', 'hidden', 'treasures', 'waiting', 'to', 'be', 'discovered',
  'mountain', 'river', 'ocean', 'valley', 'storm', 'rainbow', 'butterfly',
  'elephant', 'tiger', 'eagle', 'dolphin', 'whale', 'rabbit', 'squirrel',
  'flower', 'garden', 'meadow', 'forest', 'desert', 'island', 'castle',
  'bridge', 'tower', 'village', 'market', 'festival', 'celebration', 'music',
  'dance', 'painting', 'sculpture', 'poetry', 'novel', 'adventure', 'mystery'
];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffd700' },
    secondary: { main: '#4caf50' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#fff', secondary: '#b0b0b0' },
    error: { main: '#f44336' },
    info: { main: '#2196f3' }
  },
  typography: { fontFamily: '"Roboto Mono", monospace' }
});

const generateWords = () => {
  const shuffled = [...SAMPLE_WORDS].sort(() => Math.random() - 0.5);
  return Array.from({ length: 200 }, (_, i) => shuffled[i % shuffled.length]);
};

export const Type = () => {
  const [words, setWords] = useState(() => generateWords());
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedChars, setTypedChars] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsFinished(true);
            setIsActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, timeLeft, isFinished]);

  useEffect(() => {
    if (startTime && totalChars > 0) {
      const mins = (Date.now() - startTime) / 1000 / 60;
      setWpm(Math.round((correctChars / 5) / mins) || 0);
      setAccuracy(Math.round((correctChars / totalChars) * 100));
    }
  }, [correctChars, totalChars, startTime]);

  const handleInputChange = e => {
    const val = e.target.value;
    if (!isActive && val && !isFinished) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    if (isFinished) return;

    setUserInput(val);
    const word = words[currentWordIndex] || '';

    if (val.endsWith(' ')) {
      const typed = val.trim();
      let correctInWord = 0;
      const maxLen = Math.max(typed.length, word.length);
      for (let i = 0; i < maxLen; i++) {
        if (typed[i] === word[i]) correctInWord++;
      }
      setCorrectChars(c => c + correctInWord);
      setTotalChars(t => t + maxLen);
      if (typed !== word) setErrors(e => e + 1);
      setCurrentWordIndex(i => i + 1);
      setTypedChars([]);
      setUserInput('');
    } else {
      const chars = val.split('').map((ch, i) => ({
        char: ch,
        isCorrect: word[i] === ch,
        isExtra: i >= word.length
      }));
      setTypedChars(chars);
    }
  };

  const resetTest = () => {
    setWords(generateWords());
    setCurrentWordIndex(0);
    setTypedChars([]);
    setUserInput('');
    setIsActive(false);
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setCorrectChars(0);
    setTotalChars(0);
    setStartTime(null);
    setIsFinished(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const setTimer = sec => {
    if (!isActive) {
      setTimeLeft(sec);
      setIsFinished(false);
    }
  };

  const progress = ((60 - timeLeft) / 60) * 100;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          MonkeyType Clone
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Test your typing speed and accuracy
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          {[
            { Icon: Speed, value: wpm, label: 'WPM', color: 'primary.main' },
            { Icon: CheckCircle, value: `${accuracy}%`, label: 'Accuracy', color: 'secondary.main' },
            { Icon: Timer, value: `${timeLeft}s`, label: 'Time', color: 'info.main' },
            { Icon: ErrorOutline, value: errors, label: 'Errors', color: 'error.main' }
          ].map(({ Icon, value, label, color }) => (
            <Box key={label} textAlign="center">
              <Icon sx={{ fontSize: 28, color }} />
              <Typography variant="h6" color={color}>{value}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Box>
          ))}
        </Box>

        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8, borderRadius: 4 }} />

        <Paper
          onClick={() => inputRef.current?.focus()}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'background.default',
            minHeight: 120,
            borderRadius: 2,
            lineHeight: 1.6,
            '& span': { transition: 'background-color 0.3s, color 0.3s' }
          }}
        >
          {words.map((word, i) => {
            const isCurrent = i === currentWordIndex;
            const typedLen = typedChars.length;
            return (
              <Fade in appear key={i} timeout={isCurrent ? 300 : 0}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    mr: 1,
                    px: isCurrent ? 0.5 : 0,
                    borderRadius: isCurrent ? 1 : 0,
                    bgcolor: isCurrent
                      ? typedLen === 0
                        ? 'primary.main'
                        : typedChars.every(c => c.isCorrect) && typedLen === word.length
                          ? 'rgba(76,175,80,0.3)'
                          : 'rgba(244,67,54,0.3)'
                      : 'transparent'
                  }}
                >
                  {word.split('').map((ch, ci) => {
                    let color = 'text.secondary';
                    if (isCurrent) {
                      if (ci < typedLen) {
                        color = typedChars[ci].isCorrect ? 'text.primary' : 'error.contrastText';
                      }
                    } else if (i < currentWordIndex) {
                      color = 'text.disabled';
                    }
                    return (
                      <Box component="span" key={ci} sx={{ color }}>
                        {ch}
                      </Box>
                    );
                  })}
                  {isCurrent && typedLen > word.length && (
                    <Box component="span" sx={{ color: 'error.contrastText' }}>
                      {typedChars.slice(word.length).map((t, idx) => t.char)}
                    </Box>
                  )}
                </Box>
              </Fade>
            );
          })}
        </Paper>

        <TextField
          inputRef={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={isFinished}
          placeholder={isFinished ? 'Test complete! Click Reset.' : 'Start typing...'}
          fullWidth
          autoComplete="off"
          sx={{
            mb: 3,
            '& .MuiInputBase-input': {
              color: 'transparent',
              caretColor: 'primary.main',
              fontFamily: 'monospace',
              fontSize: '1.2rem'
            },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
          }}
        />

        <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
          <Button variant="contained" startIcon={<RestartAlt />} onClick={resetTest}>
            Reset
          </Button>
          {[15, 30, 60].map(sec => (
            <Button
              key={sec}
              variant={timeLeft === sec && !isActive ? 'contained' : 'outlined'}
              onClick={() => setTimer(sec)}
            >
              {sec}s
            </Button>
          ))}
        </Stack>

        {isFinished && (
          <Fade in>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom color="primary">
                Test Complete! 🎉
              </Typography>
              <Button variant="contained" startIcon={<RestartAlt />} onClick={resetTest}>
                Try Again
              </Button>
            </Paper>
          </Fade>
        )}
      </Container>
    </ThemeProvider>
);
}
