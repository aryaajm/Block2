"use client";

import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  function selectFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.name.toLowerCase().endsWith('.txt') && nextFile.type !== 'text/plain') {
      setError('Please choose a plain text (.txt) document.');
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setError('This file is too large. Choose a document under 5 MB.');
      return;
    }

    setFile(nextFile);
    setResponse(null);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Upload a document before asking a question.');
      return;
    }
    if (!question.trim()) {
      setError('Write a question about your document first.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setCopied(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    try {
      const res = await fetch('/api/chat', { method: 'POST', body: formData });
      const answer = await res.text();
      if (!res.ok) throw new Error(answer || 'Request failed.');
      setResponse(answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyAnswer() {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy the answer. You can still select and copy the text.');
    }
  }

  return (
    <main className="workspace-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Margin home">
          <span className="wordmark-mark" aria-hidden="true">m.</span>
          <span>margin</span>
        </a>
        <span className="topbar-note"><span className="privacy-dot" /> Private reading room</span>
      </header>

      <div className="workspace-content">
        <section className="intro">
          <p className="eyebrow"><span /> DOCUMENT Q&amp;A</p>
          <h1>Get closer to<br /><em>what you read.</em></h1>
          <p className="intro-copy">Bring a document. Ask the question on your mind. Get an answer grounded in the text, not the internet.</p>
        </section>

        <div className="workbench">
          <form className="question-panel" onSubmit={handleSubmit} noValidate>
            <div className="panel-heading">
              <div>
                <span className="step-label">01 <span>YOUR SOURCE</span></span>
                <h2>Start with a document</h2>
              </div>
              <span className="format-note">TXT · UP TO 5 MB</span>
            </div>

            <input
              ref={fileInputRef}
              id="document"
              className="visually-hidden"
              type="file"
              accept=".txt,text/plain"
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <div
              className={`upload-zone${isDragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}`}
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                selectFile(event.dataTransfer.files?.[0]);
              }}
            >
              {file ? (
                <div className="selected-file">
                  <span className="file-mark" aria-hidden="true">TXT</span>
                  <div className="file-details">
                    <p className="file-name" title={file.name}>{file.name}</p>
                    <p className="file-size">{file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(file.size < 10 * 1024 ? 1 : 0)} KB`} · Ready to read</p>
                  </div>
                  <button className="text-button" type="button" onClick={() => fileInputRef.current?.click()}>Replace</button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <span className="upload-symbol" aria-hidden="true">+</span>
                  <div>
                    <p><button className="inline-button" type="button" onClick={() => fileInputRef.current?.click()}>Choose a file</button> or drop it here</p>
                    <span>Plain text documents only</span>
                  </div>
                </div>
              )}
            </div>

            <div className="question-heading">
              <label className="step-label" htmlFor="question">02 <span>YOUR QUESTION</span></label>
              {question.length > 0 && <span className="character-count">{question.length} characters</span>}
            </div>
            <textarea
              id="question"
              value={question}
              onChange={(event) => { setQuestion(event.target.value); if (error) setError(''); }}
              placeholder="What would you like to know?"
              rows={4}
              maxLength={1000}
              aria-describedby={error ? 'form-error' : undefined}
            />

            {error && <p className="form-error" id="form-error" role="alert"><span aria-hidden="true">!</span>{error}</p>}

            <div className="form-footer">
              <p className="grounding-note"><span aria-hidden="true">✳</span> Answers stay grounded in your document</p>
              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? <><span className="button-spinner" /> Thinking…</> : <>Ask your document <span aria-hidden="true">↗</span></>}
              </button>
            </div>
          </form>

          <section className={`answer-panel${response ? ' has-answer' : ''}${loading ? ' is-loading' : ''}`} aria-live="polite" aria-busy={loading}>
            <div className="answer-topline">
              <span className="step-label">03 <span>THE RESPONSE</span></span>
              {response && <button className="copy-button" type="button" onClick={copyAnswer} aria-label="Copy answer">{copied ? 'Copied' : 'Copy answer'} <span aria-hidden="true">⧉</span></button>}
            </div>
            {loading ? (
              <div className="thinking-state">
                <span className="thinking-spinner" aria-hidden="true" />
                <h2>Reading between the lines.</h2>
                <p>Finding what your document says about it…</p>
              </div>
            ) : response ? (
              <div className="answer-content">
                <h2>Your answer</h2>
                <div className="answer-copy"><ReactMarkdown>{response}</ReactMarkdown></div>
                <div className="source-note"><span aria-hidden="true">✳</span> Based only on {file?.name || 'your document'}</div>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-symbol" aria-hidden="true">↗</span>
                <h2>Your answer<br />will find its place here.</h2>
                <p>Upload a document and ask away. The response will be drawn from your text.</p>
              </div>
            )}
          </section>
        </div>
        <footer className="page-footer"><span>READ WITH INTENTION</span><span>YOUR TEXT. YOUR QUESTIONS.</span></footer>
      </div>
    </main>
  );
}
