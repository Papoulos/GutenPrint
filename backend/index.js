const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.post('/generate-book', (req, res) => {
  const { book } = req.body;
  if (!book) {
    return res.status(400).send({ error: 'Book data is required' });
  }

  const generateHTML = (book) => {
    const styles = `
      body {
        font-family: 'Times New Roman', serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        counter-reset: page;
      }
      .page {
        width: 14.8cm;
        min-height: 21cm;
        padding: 2cm;
        margin: 1cm auto;
        background: white;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
        position: relative;
        page-break-after: always;
        box-sizing: border-box;
      }
      .title-page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        height: 21cm; /* Full page height */
      }
      .chapter-page {
        text-align: justify;
      }
      h1 {
        font-size: 28px;
        margin-bottom: 1rem;
      }
      h2 {
        font-size: 20px;
        text-transform: uppercase;
        margin-bottom: 2rem;
      }
      p {
        text-indent: 1.5em;
        line-height: 1.6;
        margin-bottom: 1em;
      }
      .page::after {
        counter-increment: page;
        content: counter(page);
        position: absolute;
        bottom: 1cm;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10pt;
      }
      @media print {
        body {
          background-color: white;
        }
        .page {
          margin: 0;
          box-shadow: none;
        }
      }
    `;

    let html = `
      <html>
        <head>
          <title>${book.title}</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="page title-page">
            <h1>${book.title}</h1>
            <h2>${book.author}</h2>
          </div>
    `;

    book.chapters.forEach(chapter => {
      html += `
        <div class="page chapter-page">
          <h3>${chapter.title}</h3>
          ${chapter.content.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, ' ').trim()}</p>`).join('')}
        </div>
      `;
    });

    html += `
        </body>
      </html>
    `;

    return html;
  };

  const html = generateHTML(book);
  res.send(html);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
