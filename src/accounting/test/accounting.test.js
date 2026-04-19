const {
  OPERATION_CODES,
  DataProgram,
  Operations,
  printMenu,
  processUserChoice,
  runApplication,
} = require('../index');

function createMockRl(inputs = []) {
  const queue = [...inputs];
  return {
    question: jest.fn(async () => {
      if (queue.length === 0) {
        return '';
      }
      return queue.shift();
    }),
    close: jest.fn(),
  };
}

describe('Student Account Test Plan Mapping', () => {
  test('TC-001: Main menu displays all options', () => {
    const logs = [];
    const logger = (line) => logs.push(line);

    printMenu(logger);

    expect(logs).toEqual([
      '--------------------------------',
      'Account Management System',
      '1. View Balance',
      '2. Credit Account',
      '3. Debit Account',
      '4. Exit',
      '--------------------------------',
    ]);
  });

  test('TC-002: Exit option ends the session', async () => {
    const logs = [];
    const rl = createMockRl(['4']);

    await runApplication({ rl, logger: (line) => logs.push(line) });

    expect(logs).toContain('Exiting the program. Goodbye!');
    expect(rl.close).toHaveBeenCalledTimes(1);
  });

  test('TC-003: Invalid menu choice is rejected', async () => {
    const logs = [];
    const operations = new Operations(new DataProgram(), createMockRl(), (line) => logs.push(line));

    const shouldContinue = await processUserChoice(9, operations, (line) => logs.push(line));

    expect(shouldContinue).toBe(true);
    expect(logs).toContain('Invalid choice, please select 1-4.');
  });

  test('TC-004: View balance returns default initial balance', async () => {
    const logs = [];
    const operations = new Operations(new DataProgram(), createMockRl(), (line) => logs.push(line));

    await operations.run(OPERATION_CODES.TOTAL);

    expect(logs).toContain('Current balance: 1000.00');
  });

  test('TC-005: Credit increases balance by entered amount', () => {
    const operations = new Operations(new DataProgram(), createMockRl(), () => {});

    operations.credit(200.0);

    expect(operations.getBalance()).toBeCloseTo(1200.0, 2);
  });

  test('TC-006: Multiple credits are cumulative', () => {
    const operations = new Operations(new DataProgram(), createMockRl(), () => {});

    operations.credit(100.0);
    operations.credit(50.0);

    expect(operations.getBalance()).toBeCloseTo(1150.0, 2);
  });

  test('TC-007: Debit with sufficient funds reduces balance', () => {
    const operations = new Operations(new DataProgram(), createMockRl(), () => {});

    const result = operations.debit(250.0);

    expect(result.success).toBe(true);
    expect(operations.getBalance()).toBeCloseTo(750.0, 2);
  });

  test('TC-008: Debit equal to current balance is allowed', () => {
    const operations = new Operations(new DataProgram(), createMockRl(), () => {});

    const result = operations.debit(1000.0);

    expect(result.success).toBe(true);
    expect(operations.getBalance()).toBeCloseTo(0.0, 2);
  });

  test('TC-009: Debit with insufficient funds is rejected', async () => {
    const logs = [];
    const operations = new Operations(new DataProgram(), createMockRl(), (line) => logs.push(line));

    await operations.run(OPERATION_CODES.DEBIT, 1000.01);

    expect(logs).toContain('Insufficient funds for this debit.');
    expect(operations.getBalance()).toBeCloseTo(1000.0, 2);
  });

  test('TC-010: Balance inquiry reflects latest committed state', () => {
    const operations = new Operations(new DataProgram(), createMockRl(), () => {});

    operations.credit(300.0);
    operations.debit(125.0);

    expect(operations.getBalance()).toBeCloseTo(1175.0, 2);
  });

  test('TC-011: Balance persists during one running session', () => {
    const operations = new Operations(new DataProgram(), createMockRl(), () => {});

    operations.credit(10.0);
    const firstRead = operations.getBalance();
    const secondRead = operations.getBalance();

    expect(firstRead).toBeCloseTo(1010.0, 2);
    expect(secondRead).toBeCloseTo(1010.0, 2);
  });

  test('TC-012: Balance resets on new application run', () => {
    const firstSessionOps = new Operations(new DataProgram(), createMockRl(), () => {});
    firstSessionOps.credit(200.0);

    const secondSessionOps = new Operations(new DataProgram(), createMockRl(), () => {});

    expect(firstSessionOps.getBalance()).toBeCloseTo(1200.0, 2);
    expect(secondSessionOps.getBalance()).toBeCloseTo(1000.0, 2);
  });

  test('TC-013: Amount precision supports two decimal places', () => {
    const operations = new Operations(new DataProgram(), createMockRl(), () => {});

    operations.credit(0.25);

    expect(operations.getBalance()).toBeCloseTo(1000.25, 2);
  });

  test('TC-014: Operation routing maps menu options to correct behavior', async () => {
    const callOrder = [];
    const fakeOps = {
      run: jest.fn(async (operationCode) => {
        callOrder.push(operationCode);
      }),
    };

    const keepGoingAfter1 = await processUserChoice(1, fakeOps, () => {});
    const keepGoingAfter2 = await processUserChoice(2, fakeOps, () => {});
    const keepGoingAfter3 = await processUserChoice(3, fakeOps, () => {});
    const keepGoingAfter4 = await processUserChoice(4, fakeOps, () => {});

    expect(callOrder).toEqual([OPERATION_CODES.TOTAL, OPERATION_CODES.CREDIT, OPERATION_CODES.DEBIT]);
    expect(keepGoingAfter1).toBe(true);
    expect(keepGoingAfter2).toBe(true);
    expect(keepGoingAfter3).toBe(true);
    expect(keepGoingAfter4).toBe(false);
  });
});
