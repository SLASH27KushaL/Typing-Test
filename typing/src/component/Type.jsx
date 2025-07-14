// Type.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  LinearProgress,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import {
  RestartAlt,
  Speed,
  CheckCircle,
  Timer,
  ErrorOutline
} from '@mui/icons-material';

const SAMPLE_WORDS = [
  'the','quick','brown','fox','jumps','over','lazy','dog','and','runs',
  'through','forest','while','birds','sing','songs','above','trees','where',
  'sunlight','filters','down','creating','beautiful','patterns','on','ground',
  'beneath','their','feet','as','they','continue','journey','toward','distant',
  'mountains','that','rise','majestically','against','clear','blue','sky',
  'with','white','clouds','drifting','slowly','across','horizon','like',
  'ships','sailing','through','ocean','of','dreams','and','memories',
  'from','past','adventures','shared','with','friends','who','laugh',
  'together','around','campfire','under','starry','night','telling',
  'stories','about','brave','heroes','magical','creatures','ancient',
  'wisdom','hidden','treasures','waiting','to','be','discovered',
  'mountain','river','ocean','valley','storm','rainbow','butterfly',
  'elephant','tiger','eagle','dolphin','whale','rabbit','squirrel',
  'flower','garden','meadow','forest','desert','island','castle',
  'bridge','tower','village','market','festival','celebration','music',
  'dance','painting','sculpture','poetry','novel','adventure','mystery'
];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#ffd700' },
    secondary: { main: '#4caf50' },
    background:{ default: '#121212', paper: '#1e1e1e' },
    text:      { primary: '#fff', secondary: '#b0b0b0' },
    error:     { main: '#f44336' },
    info:      { main: '#2196f3' }
  },
  typography: {
    fontFamily: '"Roboto Mono", monospace',
    h4:    { fontSize: '2.5rem' },
    body1:{ fontSize: '1.25rem' }
  }
});

const generateWords = () => {
  const shuffled = [...SAMPLE_WORDS].sort(() => Math.random() - 0.5);
  return Array.from({ length: 200 }, (_, i) => shuffled[i % shuffled.length]);
};

export const Type = () => {
  // state
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

  // focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // countdown timer
  useEffect(() => {
    if (!isActive || isFinished) return;
    if (timeLeft <= 0) {
      setIsFinished(true);
      setIsActive(false);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [isActive, timeLeft, isFinished]);

  // WPM & accuracy
  useEffect(() => {
    if (!startTime || totalChars === 0) return;
    const minutes = (Date.now() - startTime) / 1000 / 60;
    setWpm(Math.round((correctChars / 5) / minutes) || 0);
    setAccuracy(Math.round((correctChars / totalChars) * 100));
  }, [correctChars, totalChars, startTime]);

  // handle typing & finalize words
  const handleInputChange = e => {
    const val = e.target.value;
    if (!isActive && val && !isFinished) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    if (isFinished) return;

    setUserInput(val);
    const target = words[currentWordIndex] || '';

    if (val.endsWith(' ')) {
      const typed = val.trim();
      const maxLen = Math.max(typed.length, target.length);
      let correctCount = 0;
      for (let i = 0; i < maxLen; i++) {
        if (typed[i] === target[i]) correctCount++;
      }
      setCorrectChars(c => c + correctCount);
      setTotalChars(t => t + maxLen);
      if (typed !== target) setErrors(e => e + 1);
      setCurrentWordIndex(i => i + 1);
      setTypedChars([]);
      setUserInput('');
    } else {
      setTypedChars(
        val.split('').map((ch, i) => ({
          char: ch,
          isCorrect: ch === target[i],
          isExtra: i >= target.length
        }))
      );
    }
  };

  // allow backspace to previous word
  const handleKeyDown = e => {
    if (
      e.key === 'Backspace' &&
      userInput === '' &&
      currentWordIndex > 0 &&
      !isFinished
    ) {
      e.preventDefault();
      const prev = currentWordIndex - 1;
      const prevWord = words[prev] || '';
      setCurrentWordIndex(prev);
      setUserInput(prevWord + ' ');
      // treat entire prev word as “typed” so you can edit
      setTypedChars(prevWord.split('').map(ch => ({ char: ch, isCorrect: true })));
    }
  };

  // reset
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

  // change timer before start
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

      <Box sx={{ width: '100%', minHeight: '100vh', px: 2, py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          TYPING TEST
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" mb={3}>
          Test your typing speed and accuracy
        </Typography>

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
          {[
            { Icon: Speed, value: wpm, label: 'WPM', color: 'primary.main' },
            { Icon: CheckCircle, value: `${accuracy}%`, label: 'Accuracy', color: 'secondary.main' },
            { Icon: Timer, value: `${timeLeft}s`, label: 'Time', color: 'info.main' },
            { Icon: ErrorOutline, value: errors, label: 'Errors', color: 'error.main' }
          ].map(({ Icon, value, label, color }) => (
            <Box key={label} textAlign="center">
              <Icon sx={{ fontSize: 32, color }} />
              <Typography variant="h6" sx={{ fontSize: '1.5rem', color }}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 3, height: 10, borderRadius: 4 }}
        />

        {/* Word display panel */}
        <Paper
          onClick={() => inputRef.current?.focus()}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'rgba(0,0,0,0.6)',
            height: '20rem',
            overflowY: 'auto',
            borderRadius: 2,
            lineHeight: 1.6,
            fontSize: '1.5rem',
            '& span': { transition: 'background-color 0.2s, color 0.2s' }
          }}
        >
          {words.map((wProp, idx) => {
            const w = wProp || '';
            const isCurr = idx === currentWordIndex;
            const len = typedChars.length;
            return (
              <Box
                component="span"
                key={idx}
                sx={{
                  display: 'inline-block',
                  mr: 1,
                  px: isCurr ? 0.5 : 0,
                  borderRadius: 1,
                  bgcolor: isCurr
                    ? len === 0
                      ? 'primary.main'
                      : typedChars.every(c => c.isCorrect) && len === w.length
                        ? 'rgba(76,175,80,0.3)'
                        : 'rgba(244,67,54,0.3)'
                    : 'transparent'
                }}
              >
                {w.split('').map((ch, ci) => {
                  const isTyped = isCurr && ci < len;
                  const displayChar = isTyped ? typedChars[ci].char : ch;
                  let col = 'text.secondary';
                  if (isCurr && ci < len) {
                    col = typedChars[ci].isCorrect ? 'text.primary' : 'error.contrastText';
                  } else if (idx < currentWordIndex) {
                    col = 'text.disabled';
                  }
                  return (
                    <Box component="span" key={ci} sx={{ color: col }}>
                      {displayChar}
                    </Box>
                  );
                })}
                {isCurr && len > w.length && (
                  <Box component="span" sx={{ color: 'error.contrastText' }}>
                    {typedChars.slice(w.length).map(t => t.char).join('')}
                  </Box>
                )}
              </Box>
            );
          })}
        </Paper>

        {/* Input */}
        <TextField
          inputRef={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
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
              fontSize: '2rem'
            },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
          }}
        />

        {/* Controls */}
        <Stack direction="row" spacing={2} justifyContent="center">
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
      </Box>
    </ThemeProvider>
  );
};
