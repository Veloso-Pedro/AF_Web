import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { dbName: 'GestorFinanceiro' })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro na conexão:', err.message));

const transacaoSchema = new mongoose.Schema({
  descricao: { type: String, required: true, trim: true, minlength: 2 },
  valor:     { type: Number, required: true, min: 0.01 },
  tipo:      { type: String, required: true, enum: ['receita', 'despesa'] },
  categoria: { type: String, required: true, trim: true },
  data:      { type: Date, required: true }
}, { collection: 'Transacoes', timestamps: true });
const Transacao = mongoose.model('Transacao', transacaoSchema, 'Transacoes');

app.get('/', (req, res) => res.json({ msg: 'API rodando' }));

app.post('/transacoes', async (req, res) => {
  try {
    const transacao = await Transacao.create(req.body);
    res.status(201).json(transacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/transacoes', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.categoria) filtro.categoria = req.query.categoria;
    if (req.query.tipo) filtro.tipo = req.query.tipo;
    const transacoes = await Transacao.find(filtro).sort({ data: -1 });
    res.json(transacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/transacoes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const transacao = await Transacao.findById(req.params.id);
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(transacao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/transacoes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const transacao = await Transacao.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(transacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/transacoes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const transacao = await Transacao.findByIdAndDelete(req.params.id);
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`)
);
