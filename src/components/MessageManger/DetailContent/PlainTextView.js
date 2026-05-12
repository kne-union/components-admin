const PlainTextView = ({ text }) => {
  if (!text) return null;
  return (
    <pre style={{ margin: 0, padding: 12, background: '#f5f5f5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13, lineHeight: 1.6 }}>
      {text}
    </pre>
  );
};

export default PlainTextView;
