const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const OPERATION_CODES = {
  TOTAL: 'TOTAL ',
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT ',
  READ: 'READ',
  WRITE: 'WRITE',
};

function formatAmount(amount) {
  return amount.toFixed(2);
}

function printMenu(logger = console.log) {
  logger('--------------------------------');
  logger('Account Management System');
  logger('1. View Balance');
  logger('2. Credit Account');
  logger('3. Debit Account');
  logger('4. Exit');
  logger('--------------------------------');
}

class DataProgram {
  constructor() {
    this.storageBalance = 1000.0;
  }

  execute(passedOperation, balance) {
    if (passedOperation === OPERATION_CODES.READ) {
      return this.storageBalance;
    }

    if (passedOperation === OPERATION_CODES.WRITE) {
      this.storageBalance = balance;
      return this.storageBalance;
    }

    return this.storageBalance;
  }
}

class Operations {
  constructor(dataProgram, rl, logger = console.log) {
    this.dataProgram = dataProgram;
    this.rl = rl;
    this.logger = logger;
    this.finalBalance = 1000.0;
  }

  getBalance() {
    this.finalBalance = this.dataProgram.execute(OPERATION_CODES.READ, this.finalBalance);
    return this.finalBalance;
  }

  credit(amount) {
    this.finalBalance = this.dataProgram.execute(OPERATION_CODES.READ, this.finalBalance);
    this.finalBalance += amount;
    this.dataProgram.execute(OPERATION_CODES.WRITE, this.finalBalance);
    return this.finalBalance;
  }

  debit(amount) {
    this.finalBalance = this.dataProgram.execute(OPERATION_CODES.READ, this.finalBalance);

    if (this.finalBalance >= amount) {
      this.finalBalance -= amount;
      this.dataProgram.execute(OPERATION_CODES.WRITE, this.finalBalance);
      return { success: true, balance: this.finalBalance };
    }

    return { success: false, balance: this.finalBalance };
  }

  async run(passedOperation, providedAmount) {
    const operationType = passedOperation;

    if (operationType === OPERATION_CODES.TOTAL) {
      this.finalBalance = this.getBalance();
      this.logger(`Current balance: ${formatAmount(this.finalBalance)}`);
      return;
    }

    if (operationType === OPERATION_CODES.CREDIT) {
      const amount =
        typeof providedAmount === 'number' ? providedAmount : await this.promptAmount('Enter credit amount: ');
      this.finalBalance = this.credit(amount);
      this.logger(`Amount credited. New balance: ${formatAmount(this.finalBalance)}`);
      return;
    }

    if (operationType === OPERATION_CODES.DEBIT) {
      const amount =
        typeof providedAmount === 'number' ? providedAmount : await this.promptAmount('Enter debit amount: ');
      const debitResult = this.debit(amount);

      if (debitResult.success) {
        this.logger(`Amount debited. New balance: ${formatAmount(debitResult.balance)}`);
      } else {
        this.logger('Insufficient funds for this debit.');
      }
    }
  }

  async promptAmount(prompt) {
    const value = await this.rl.question(prompt);
    const parsed = Number.parseFloat(value);

    if (Number.isNaN(parsed)) {
      return 0;
    }

    return parsed;
  }
}

async function processUserChoice(userChoice, operations, logger = console.log) {
  switch (userChoice) {
    case 1:
      await operations.run(OPERATION_CODES.TOTAL);
      return true;
    case 2:
      await operations.run(OPERATION_CODES.CREDIT);
      return true;
    case 3:
      await operations.run(OPERATION_CODES.DEBIT);
      return true;
    case 4:
      return false;
    default:
      logger('Invalid choice, please select 1-4.');
      return true;
  }
}

async function runApplication(options = {}) {
  const logger = options.logger || console.log;
  const rl = options.rl || readline.createInterface({ input, output });
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, rl, logger);
  let continueFlag = 'YES';

  try {
    while (continueFlag !== 'NO') {
      printMenu(logger);

      const userChoiceInput = await rl.question('Enter your choice (1-4): ');
      const userChoice = Number.parseInt(userChoiceInput, 10);
      const shouldContinue = await processUserChoice(userChoice, operations, logger);
      continueFlag = shouldContinue ? 'YES' : 'NO';
    }

    logger('Exiting the program. Goodbye!');
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  runApplication().catch((error) => {
    console.error('Application error:', error);
    process.exitCode = 1;
  });
}

module.exports = {
  OPERATION_CODES,
  DataProgram,
  Operations,
  formatAmount,
  printMenu,
  processUserChoice,
  runApplication,
};
