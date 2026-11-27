import express from 'express';

const port = Number(process.env.PORT ?? 3000);

const app = express();

// Health check.

app.get('/status', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`HTTP server started on port ${port}.`);
});
