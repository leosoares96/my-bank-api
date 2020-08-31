import express from 'express';
import mongoose from 'mongoose';
import { accountModel } from '../models/accountModel.js';

const router = express.Router();

router.get('/account', async (req, res, next) => {
  try {
    const account = await accountModel.find({});
    res.send(account);
  } catch (err) {
    next(err);
  }
});
router.get('/account/balance', async (req, res, next) => {
  const { agencia, conta } = req.query;
  try {
    const account = await accountModel.findOne({
      $and: [{ conta: conta }, { agencia: agencia }],
    });

    if (!account) {
      throw new Error('Conta não encontrada');
    }
    res.send({ balance: account.balance });
    //res.send(account);
  } catch (err) {
    next(err);
  }
});
router.get('/account/minbalance', async (req, res, next) => {
  const { qty } = req.query;
  try {
    const account = await accountModel
      .find({}, { _id: true, agencia: true, conta: true, balance: true })
      .limit(Number(qty))
      .sort({ balance: 1 });

    if (!account) {
      throw new Error('Conta não encontrada');
    }
    res.send({ account });
  } catch (err) {
    next(err);
  }
});
router.get('/account/maxbalance', async (req, res, next) => {
  const { qty } = req.query;
  try {
    const account = await accountModel
      .find({})
      .limit(Number(qty))
      .sort({ balance: -1 });

    if (!account) {
      throw new Error('Conta não encontrada');
    }
    res.send({ account });
  } catch (err) {
    next(err);
  }
});
router.get('/account/balance/:agencia', async (req, res, next) => {
  const { agencia } = req.params;
  try {
    const accounts = await accountModel.find({ agencia: agencia });

    if (!accounts) {
      throw new Error('Agencia não encontrada');
    }
    const result = accounts
      .map((item) => item.balance)
      .reduce((acc, crr) => {
        return (acc += crr);
      });

    res.send({ media: result / accounts.length });
  } catch (err) {
    next(err);
  }
});
router.patch('/account/deposit', async (req, res, next) => {
  const { agencia, conta, balance } = req.body;
  try {
    const account = await accountModel.findOne({
      $and: [{ conta: conta }, { agencia: agencia }],
    });
    if (!account) {
      throw new Error('Conta não encontrada');
    }
    const newAccount = await accountModel.findOneAndUpdate(
      { $and: [{ conta: conta }, { agencia: agencia }] },
      { $inc: { balance: balance } },
      { new: true }
    );

    res.send({ Balance: newAccount.balance });
  } catch (err) {
    next(err);
  }
});
router.patch('/account/withdraw', async (req, res, next) => {
  const { agencia, conta, value } = req.body;
  try {
    const account = await accountModel.findOne({
      $and: [{ conta: conta }, { agencia: agencia }],
    });

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    if (account.balance < value) {
      throw new Error('Saldo Insuficiente');
    }

    const newAccount = await accountModel.findOneAndUpdate(
      { $and: [{ conta: conta }, { agencia: agencia }] },
      { $inc: { balance: (value + 1) * -1 } },
      { new: true }
    );

    res.send({ Balance: newAccount.balance });
  } catch (err) {
    next(err);
  }
});
router.patch('/account/transferMoney', async (req, res, next) => {
  const { contaOrigin, contaDestiny, value } = req.body;
  try {
    const accountOrigin = await accountModel.findOne({ conta: contaOrigin });
    const accountDestiny = await accountModel.findOne({ conta: contaDestiny });

    if (!accountOrigin) {
      throw new Error('Conta de origem não encontrada');
    }
    if (!accountDestiny) {
      throw new Error('Conta de destino não encontrada');
    }
    if (accountOrigin.balance < value) {
      throw new Error('Saldo Insuficiente para tranferência');
    }
    let tax = accountOrigin.agencia === accountDestiny.agencia ? 0 : 8;

    const newAccountOrigin = await accountModel.findOneAndUpdate(
      { conta: contaOrigin },
      { $inc: { balance: (value + tax) * -1 } },
      { new: true }
    );
    const newAccountDestiny = await accountModel.findOneAndUpdate(
      { conta: contaDestiny },
      { $inc: { balance: value } },
      { new: true }
    );
    res.send({
      BalanceOrigin: newAccountOrigin.balance,
      BalanceDestiny: newAccountDestiny.balance,
    });
  } catch (err) {
    next(err);
  }
});
router.delete('/account', async (req, res, next) => {
  const { agencia, conta } = req.body;
  try {
    const account = await accountModel.findOneAndDelete({
      $and: [{ conta: conta }, { agencia: agencia }],
    });
    if (!account) {
      throw new Error('Conta não encontrada');
    }
    const accounts = await accountModel.countDocuments({ agencia: agencia });
    res.send({ Accounts: accounts });
  } catch (err) {
    next(err);
  }
});
router.use((err, req, res, next) => {
  res.status(400).send({
    error: 'Error',
    message: err.message,
  });
  next();
});

export default router;
