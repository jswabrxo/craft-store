const glyphs: Record<string, string[]> = {
  A: ['01110', '11011', '11011', '11111', '11011', '11011', '11011'],
  U: ['11011', '11011', '11011', '11011', '11011', '11011', '01110'],
  R: ['11110', '11011', '11011', '11110', '11100', '11010', '11011'],
  P: ['11110', '11011', '11011', '11110', '11000', '11000', '11000'],
  '0': ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  O: ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  D: ['11110', '11011', '11011', '11011', '11011', '11011', '11110'],
  B: ['11110', '11011', '11011', '11110', '11011', '11011', '11110'],
  J: ['00111', '00011', '00011', '00011', '11011', '11011', '01110'],
  E: ['11111', '11000', '11000', '11110', '11000', '11000', '11111'],
  C: ['01111', '11000', '11000', '11000', '11000', '11000', '01111'],
  T: ['11111', '01110', '00100', '00100', '00100', '00100', '00100'],
  S: ['01111', '11000', '11000', '01110', '00011', '00011', '11110'],
};

export default function PixelTitle({ compact = false, about = false }: { compact?: boolean; about?: boolean }) {
  const Title = about ? 'h2' : compact ? 'span' : 'h1';
  const title = about ? 'ABOUT ODD OBJECTS' : compact ? 'DROP 01' : 'ODD OBJECTS';
  return (
    <Title id={about ? 'about-title' : undefined} className="pixel-title" aria-label={compact ? undefined : title}>
      {['trail-white', 'trail-pink', 'title-face'].map(layer => (
        <span className={`title-layer ${layer}`} key={layer} aria-hidden="true">
        {title.split(' ').map(word => (
        <span className="pixel-word" aria-hidden="true" key={word}>
          {Array.from(word).map((letter, index) => (
            <span className="pixel-letter" key={index}>
              {glyphs[letter].join('').split('').map((pixel, cell) => (
                <span key={cell} className={pixel === '1' ? 'pixel-on' : undefined} />
              ))}
            </span>
          ))}
        </span>
        ))}
        </span>
      ))}
    </Title>
  );
}
