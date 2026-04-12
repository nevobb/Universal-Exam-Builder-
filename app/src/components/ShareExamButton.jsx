import React, { useState, useRef, useEffect } from 'react';
import LZString from 'lz-string';

const DEFAULT_OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const DEFAULT_SHARE_SETTINGS = {
  theme: 'light',
  preset: 'pro',
  displayMode: 'scroll',
};
const MIN_POINT_DISTANCE = 1.5;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasEmbeddedImageData(value) {
  return typeof value === 'string' && /(data:image\/|;base64,|base64,)/i.test(value);
}

function containsEmbeddedImageData(value) {
  if (hasEmbeddedImageData(value)) return true;
  if (Array.isArray(value)) return value.some(containsEmbeddedImageData);
  if (value && typeof value === 'object') {
    return Object.values(value).some(containsEmbeddedImageData);
  }
  return false;
}

function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}

function roundDiagramNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? roundToTenth(value) : value;
}

function isSimplePointObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 2 && keys.includes('x') && keys.includes('y') &&
    typeof value.x === 'number' && Number.isFinite(value.x) &&
    typeof value.y === 'number' && Number.isFinite(value.y);
}

function decimatePoints(points) {
  if (points.length <= 1) return points;

  const decimated = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const prev = decimated[decimated.length - 1];
    const current = points[i];
    const distance = Math.hypot(current.x - prev.x, current.y - prev.y);
    if (distance >= MIN_POINT_DISTANCE) {
      decimated.push(current);
    }
  }

  return decimated;
}

function flattenPointArray(points) {
  return points.flatMap(point => [point.x, point.y]);
}

function optimizeDiagramValue(value) {
  if (Array.isArray(value)) {
    if (value.every(isSimplePointObject)) {
      const quantizedPoints = value.map(point => ({
        x: roundToTenth(point.x),
        y: roundToTenth(point.y),
      }));
      return flattenPointArray(decimatePoints(quantizedPoints));
    }

    return value.map(item => optimizeDiagramValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, optimizeDiagramValue(nestedValue)])
    );
  }

  return roundDiagramNumber(value);
}

function optimizeDiagramPayload(diagram) {
  if (!diagram || typeof diagram !== 'object') return diagram;
  return optimizeDiagramValue(diagram);
}

function buildShareSettings(settings) {
  const compactSettings = {};
  if (!settings || typeof settings !== 'object') return compactSettings;

  if (settings.theme && settings.theme !== DEFAULT_SHARE_SETTINGS.theme) {
    compactSettings.theme = settings.theme;
  }
  if (settings.preset && settings.preset !== DEFAULT_SHARE_SETTINGS.preset) {
    compactSettings.preset = settings.preset;
  }
  if (settings.displayMode && settings.displayMode !== DEFAULT_SHARE_SETTINGS.displayMode) {
    compactSettings.displayMode = settings.displayMode;
  }

  return compactSettings;
}

function normalizeOption(option) {
  if (typeof option === 'string') {
    const text = cleanString(option);
    return text ? text : null;
  }

  if (option && typeof option === 'object') {
    const text = cleanString(option.text);
    if (!text) return null;

    const normalized = { text };
    const id = cleanString(option.id);
    if (id) normalized.id = id;
    return normalized;
  }

  return null;
}

function collapseOptions(options) {
  const normalized = Array.isArray(options) ? options.map(normalizeOption).filter(Boolean) : [];
  if (normalized.length === 0) return [];

  const canCollapseToStrings = normalized.every((option, idx) =>
    typeof option === 'object' &&
    option.id === DEFAULT_OPTION_LABELS[idx] &&
    typeof option.text === 'string'
  );

  if (canCollapseToStrings) {
    return normalized.map(option => option.text);
  }

  return normalized;
}

function resolveCorrectAnswer(question, compactOptions) {
  const rawAnswer = question.correctAnswer !== undefined ? question.correctAnswer : question.answer;
  if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') return undefined;

  if (Array.isArray(compactOptions) && compactOptions.every(option => typeof option === 'string')) {
    if (typeof rawAnswer === 'number') return rawAnswer;
    if (typeof rawAnswer === 'string') {
      const labelIndex = DEFAULT_OPTION_LABELS.indexOf(rawAnswer.trim());
      if (labelIndex !== -1) return labelIndex;

      const textIndex = compactOptions.indexOf(rawAnswer.trim());
      if (textIndex !== -1) return textIndex;
    }
  }

  return rawAnswer;
}

function pickDiagramField(question, questionId, { optimizeDiagramData = false } = {}) {
  const pythonDrawer = cleanString(question.python_drawer);
  if (pythonDrawer && !hasEmbeddedImageData(pythonDrawer)) {
    return { python_drawer: pythonDrawer };
  }

  if (typeof question.diagram === 'string') {
    const diagram = cleanString(question.diagram);
    if (diagram && !hasEmbeddedImageData(diagram)) {
      return { diagram };
    }
  }

  if (question.diagram && typeof question.diagram === 'object') {
    if (containsEmbeddedImageData(question.diagram)) {
      console.warn(`[TestBuilder] Stripped embedded image/base64 data from shared payload for question ${questionId}.`);
      return {};
    }

    return {
      diagram: optimizeDiagramData ? optimizeDiagramPayload(question.diagram) : question.diagram,
    };
  }

  const svg = cleanString(question.svg);
  if (svg && !hasEmbeddedImageData(svg)) {
    return { svg };
  }

  if (hasEmbeddedImageData(question.python_drawer) || hasEmbeddedImageData(question.diagram) || containsEmbeddedImageData(question.diagram) || hasEmbeddedImageData(question.svg)) {
    console.warn(`[TestBuilder] Stripped embedded image/base64 data from shared payload for question ${questionId}.`);
  }

  return {};
}

function buildShareQuestion(question, index, title, options = {}) {
  if (!question || typeof question !== 'object') return null;

  const rawType = cleanString(question.type).toLowerCase();
  const compactOptions = collapseOptions(question.options);
  const isMcq = rawType === 'mcq' || rawType === 'multiple-choice' || compactOptions.length > 0;
  const compactQuestion = {
    id: `q${index + 1}`,
    type: isMcq ? 'MCQ' : 'Open',
    question: cleanString(question.question || question.text),
  };
  const solution = cleanString(question.solution || question.explanation);
  if (solution) {
    compactQuestion.solution = solution;
  }

  const subject = cleanString(question.subject);
  if (subject && subject !== title) {
    compactQuestion.subject = subject;
  }

  const difficulty = cleanString(question.difficulty);
  if (difficulty) {
    compactQuestion.difficulty = difficulty;
  }

  if (isMcq && compactOptions.length > 0) {
    compactQuestion.options = compactOptions;
    const compactAnswer = resolveCorrectAnswer(question, compactOptions);
    if (compactAnswer !== undefined) {
      compactQuestion.correctAnswer = compactAnswer;
    }
  }

  Object.assign(compactQuestion, pickDiagramField(question, compactQuestion.id, options));

  return compactQuestion;
}

function buildSharePayload({ questions, title, settings, optimizeDiagramData = false }) {
  const payload = {
    questions: Array.isArray(questions)
      ? questions.map((question, index) => buildShareQuestion(question, index, title, { optimizeDiagramData })).filter(Boolean)
      : [],
  };

  if (title) {
    payload.title = title;
  }

  const compactSettings = buildShareSettings(settings);
  if (Object.keys(compactSettings).length > 0) {
    payload.settings = compactSettings;
  }

  return payload;
}

export default function ShareExamButton({ examData, examTitle, shareSettings }) {
  const [copied, setCopied] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  async function shortenUrl(longUrl, metrics) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const prodUrl = "https://nevobb.github.io/Universal-Exam-Builder-/";
      let urlToShorten = longUrl;

      // spoo.me rejects localhost, so we swap it with the production URL for the shortening service
      if (window.location.hostname === "localhost") {
        try {
          const urlObj = new URL(longUrl);
          urlToShorten = prodUrl + urlObj.search + urlObj.hash;
        } catch (e) {
          console.warn('[TestBuilder] URL parsing failed for local override, using original longUrl');
        }
      }

      console.log('[TestBuilder] Share payload metrics', {
        'Original JSON length': metrics.originalJsonLength,
        'Pre-Quantization compact JSON length': metrics.compactJsonLength,
        'Post-Quantization compact JSON length': metrics.postQuantizationJsonLength,
        'Compressed string length': metrics.compressedStringLength,
        'Final URL length': urlToShorten.length,
      });

      const response = await fetch('https://spoo.me/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: `url=${encodeURIComponent(urlToShorten)}`,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`spoo.me request failed with status ${response.status}`);
      }

      const data = await response.json();
      const shortUrl = data.short_url || data.shorturl;

      if (!shortUrl) {
        throw new Error('spoo.me response did not include a valid short URL');
      }

      console.log('[TestBuilder] Success! short_url:', shortUrl);
      return shortUrl;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function handleShare() {
    if (!examData || (Array.isArray(examData) && examData.length === 0)) return;

    setCopied(false);
    setIsShortening(true);
    try {
      const originalPayload = {
        title: examTitle,
        settings: shareSettings,
        questions: examData,
      };
      const compactPayloadBeforeQuantization = buildSharePayload({
        questions: examData,
        title: cleanString(examTitle),
        settings: shareSettings,
        optimizeDiagramData: false,
      });
      const compactPayload = buildSharePayload({
        questions: examData,
        title: cleanString(examTitle),
        settings: shareSettings,
        optimizeDiagramData: true,
      });
      const compactJson = JSON.stringify(compactPayloadBeforeQuantization);
      const json = JSON.stringify(compactPayload);
      const compressedData = LZString.compressToEncodedURIComponent(json);
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = new URL(baseUrl);
      shareUrl.searchParams.set('exam', compressedData);

      let finalUrl = shareUrl.toString();

      try {
        finalUrl = await shortenUrl(finalUrl, {
          originalJsonLength: JSON.stringify(originalPayload).length,
          compactJsonLength: compactJson.length,
          postQuantizationJsonLength: json.length,
          compressedStringLength: compressedData.length,
        });
      } catch (err) {
        console.warn('[TestBuilder] Short URL generation failed, using long URL instead:', err);
      }

      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[TestBuilder] Clipboard copy failed:', err);
    } finally {
      setIsShortening(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label={isShortening ? 'Generating short share link' : copied ? 'Copied to clipboard' : 'Share exam via link'}
      aria-pressed={copied}
      disabled={isShortening}
      style={{
        marginTop: '24px',
        padding: '14px 32px',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary)',
        border: '2px solid var(--color-primary)',
        borderRadius: 'var(--radius-button)',
        fontSize: '16px',
        fontWeight: '700',
        cursor: isShortening ? 'progress' : 'pointer',
        opacity: isShortening ? 0.8 : 1,
        transition: 'all 0.2s',
      }}
    >
      {isShortening ? 'מייצר לינק קצר...' : copied ? '✅ הועתק ללוח!' : 'שתף מבחן 🔗'}
    </button>
  );
}
