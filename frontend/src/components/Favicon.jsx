import { useState } from 'react';
import './CSS/favicon.css';

function getHostname(url) {
  try { return new URL(url).hostname; }
  catch { return ''; }
}

function getFallbackLetter(url) {
  try { return new URL(url).hostname.replace('www.', '')[0].toUpperCase(); }
  catch { return '?'; }
}

export default function Favicon({ url }) {
  const [failed, setFailed] = useState(false);
  const hostname = getHostname(url);

  if (!hostname || failed) {
    return <div className="lv-favicon lv-favicon-letter">{getFallbackLetter(url)}</div>;
  }

  return (
    <div className="lv-favicon">
      <img
        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
        alt=""
        className="lv-favicon-img"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}
