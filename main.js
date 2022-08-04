'use strict';

const { print, stringInput, intInput } = require('./consoleIO');

const REGISTER_CODE = 0;
const LOGIN_CODE = 1;
const PAY_CODE = 0;
let loggedInUser = null;
const users = [];
let exit = false;
const handledError = new Error();
const TRANSACTIONS_CODE = 1;
const STATS_CODE = 2;
const LOGOUT_CODE = 3;

const propertyExistsInArray = (prop, val) => users.some(x => x[prop] === val[prop]);

// Fixed
const nameExistsInArray = name => propertyExistsInArray('name', name);

// Fixed
const phoneExistsInArray = phone => propertyExistsInArray('phone', phone);

// Fixed
const validateUserDetails = user => {
  return user.age > 18
    && !phoneExistsInArray(user.phone)
    && !nameExistsInArray(users, user)
    && user.pin > 999
    && user.pin < 10_000;
}

// Fixed
const handleRegister = () => {
  const user = {};

  print('Enter username');
  user.name = stringInput();

  print('Enter password');
  user.password = stringInput();

  print('Enter phone');
  user.phone = stringInput();

  print('Enter age');
  user.age = intInput();

  print('Enter PIN');
  user.pin = intInput();

  user.frame = user.age >= 22 ? 2000 : 1000;

  user.transactions = [];

  if (validateUserDetails(user)) {
    users.push();
    loggedInUser = user;
  } else {
    print("Invalid details");
  }
};

const handlePay = () => {
  print("How much do you want to pay?");
  let amount = intInput();
  let sum = loggedInUser
    .transactions
    .filter(trans => trans.kind === 'out')
    .reduce((acc, trans) => acc + trans.amout, 0);

  while(sum + amount > loggedInUser.frame) {
    print("Not enough credit frame");
    amount = intInput();
  }

  print("Phone number to pay to: ");
  let phone = stringInput();

  while (!phoneExistsInArray(phone) || loggedInUser == phone) {
    print("Phone number does not exists or it\"s your number. Please try again:");
    phone = stringInput();
  }


  print("Enter PIN");
  let pin = intInput();
  while (loggedInUser.pin !== pin) {
    print("Incorrect PIN, please try again.");
    pin = intInput();
  }
  let transToAdd = {};
  transToAdd.kind = "out";
  transToAdd.to = phone;
  transToAdd.amount = amount;
  loggedInUser.transactions.push(transToAdd);
  transToAdd.kind = "in";
  transToAdd.from = loggedInUser.phone;
  transToAdd.amount = amount;
  users.find((currUser) => currUser.phone === phone)
    .transactions.push(transToAdd);
};

const printTransactions = () => {
  print("All transactions:");

  loggedInUser.transactions.forEach((transaction) => {
    print(transaction.kind == "out" ? `-${transaction.amount} to: ${transaction.to}` : `+${transaction.amount} from: ${transaction.froms}`);
  });
};

const calcStats = transactions => {
  let sum = 0, avg;
  for(curr of transactions) {
    sum += curr.amount;
  }
  
  if(transactions.length === 0) {avg = 0;} 
  else {avg = sum / transactions.length;}

  return [ transactions.length, sum, avg ];
};

 // FIXME: doens't print all stats
const printStats = () => {
  let [ length, sum, avg ] = calcStats(loggedInUser.transactions.filter((transaction) => transaction.kind === "out"));
  let [ length2, sum2, avg2 ] = calcStats(loggedInUser.transactions.filter((transaction) => transaction.kind === "in"));

  print("OUT:");
  print("Total payments amount: "+ length);
  print("Sum of payments:" +sum);
  print("Avg of payments: " +avg);

  print("IN:");
  print("Total payments amount: " +length2);
  print("Sum of payments:" +sum2);
  print("Avg of payments: " +avg2);
};

const printOptions = (args = {printToConsole:true}) => {
  if(!args.printToConsole) {
    return;
  } else {
  print("\nOptions:" + 
  PAY_CODE + " - To pay" + 
  TRANSACTIONS_CODE+"  - To see transactions." +
  STATS_CODE+ "- To see stats." + 
  LOGOUT_CODE + " - To log out.");

  const choice = intInput();

  switch (choice) {
    case PAY_CODE: {
      handlePay();
      break;
    }
    case TRANSACTIONS_CODE: {
      printTransactions();
      break;
    }
    case STATS_CODE: {
      printStats();
      break;
    }
    case LOGOUT_CODE: {
      loggedInUser = null;
      print("Goodbye!");
      break;
    }
    default: {
      print("Invalid option.");
      break;
    }
  }
}
};

const handleLogin = () => {
  print('Enter username');
  let name = stringInput();
  print('Enter password');
  let password = stringInput();

  let user = users.find(currUser => currUser.name === name);

  if(!user || user.password !== password) {
    print('Incorrect username or password');
    print('Enter username');
    name = stringInput();
    print('Enter password');
    password = stringInput();

    user = users.find((currUser) => currUser.name === name);
  } else {
    loggedInUser = user;
  }
};

// Fixed
const printGreetingMenu = () => {
  // Doing this with multiple print statements since I don't want to deal with indentation
  print('Welcome to "BSMCH PAY"');
  print(`To login enter ${LOGIN_CODE}`);
  print(`To create an account enter ${REGISTER_CODE}`);
  print('To exit click anything else');
  const userChoice = intInput();

  if (userChoice === REGISTER_CODE) {
    handleRegister();
  } else if (userChoice === LOGIN_CODE) {
    handleLogin();
  } else {
    exit = true;
    print('Goodbye :)');
  }
};

while (!exit) {
  printGreetingMenu();

  while (loggedInUser !== null) {
    printOptions();
  }
}

