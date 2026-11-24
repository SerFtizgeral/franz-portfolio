'use client';

import { useRef, useState } from 'react';
import { artwork } from './content';
import { mediaPath } from './media';

export default function Gallery() {
  const dialog = useRef(null);
  const [selected, setSelected] = useState(0);
  const active = artwork[selected];

  function move(offset) {
    setSelected((index) => (index + offset + artwork.length) % artwork.length);
  }

  return (
    <>
      <div className="art-grid">
        {artwork.map(({ image, label, tool }, index) => (
          <button className="art-card" key={image} type="button" onClick={() => {
            setSelected(index);
            dialog.current.showModal();
          }}>
            <span className="art-media" data-parallax-media>
              <img src={mediaPath(`${image}.webp`)} alt="" loading="lazy" />
            </span>
            <span className="art-caption"><strong>{label}</strong><span>{tool}</span></span>
          </button>
        ))}
      </div>
      <dialog ref={dialog} className="lightbox" aria-labelledby="art-title" onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') move(-1);
        if (event.key === 'ArrowRight') move(1);
      }}>
        <div className="lightbox-bar">
          <h3 id="art-title">{active.label}</h3>
          <button type="button" autoFocus onClick={() => dialog.current.close()}>Close</button>
        </div>
        <img src={mediaPath(`${active.image}.webp`)} alt={active.label} loading="lazy" />
        <div className="lightbox-bar">
          <button type="button" onClick={() => move(-1)}>Previous</button>
          <span>{active.tool}</span>
          <button type="button" onClick={() => move(1)}>Next</button>
        </div>
      </dialog>
    </>
  );
}
