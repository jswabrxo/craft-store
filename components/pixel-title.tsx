const glyphs: Record<string, string[]> = {
  O: ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  D: ['11110', '11011', '11011', '11011', '11011', '11011', '11110'],
  B: ['11110', '11011', '11011', '11110', '11011', '11011', '11110'],
  J: ['00111', '00011', '00011', '00011', '11011', '11011', '01110'],
  E: ['11111', '11000', '11000', '11110', '11000', '11000', '11111'],
  C: ['01111', '11000', '11000', '11000', '11000', '11000', '01111'],
  T: ['11111', '01110', '00100', '00100', '00100', '00100', '00100'],
  S: ['01111', '11000', '11000', '01110', '00011', '00011', '11110'],
};

export default function PixelTitle() {
  return (
    <h1 className="pixel-title" aria-label="ODD OBJECTS">
      {['ODD', 'OBJECTS'].map(word => (
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
    </h1>
  );
}
