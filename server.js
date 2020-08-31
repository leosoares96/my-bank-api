import express from 'express';
import mongoose from 'mongoose';
import accountRouter from './src/routes/accounts.js';

mongoose
  .connect(
    'mongodb+srv://leosoares96:010203@bootcampigti.xxkeq.mongodb.net/my-bank?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then(() => {
    console.log('Conectado ao MongoDB Atlas');
  })
  .catch((err) => {
    console.log('Erro ao conectar ao MongoDB: ' + err);
  });

const app = express();
app.use(express.json());
app.use(accountRouter);

app.listen('3000', () => {
  console.log('API Started!');
});
