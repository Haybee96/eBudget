/*
This app should have 3 modules;

1. Budget controller
2. User interface controller
3. Global app controller

*/

// budget controller
var budgetController = (function () {
  // Expense function constructor
  var Expense = function (id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.percentage = -1;
  };

  Expense.prototype.calcPerc = function (totInc) {
    if (totInc > 0) {
      this.percentage = Math.round((this.amount / totInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // Get percentage
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  // Income function constructor
  var Income = function (id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
  };

  const calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.amount;
    });
    data.totals[type] = sum;
  };

  // data
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  // public methods
  return {
    addItem: function (type, desc, amt) {
      var newItem, ID;

      // [1,2,3,4,5] nextID = 6
      // [1,3,4,5,7] nextID = 8
      // lastID = length - 1

      // Generate new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // use the constructor to create new object item based on type 'inc' or 'exp'
      if (type === "exp") {
        newItem = new Expense(ID, desc, amt);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, amt);
      }

      // store the new item
      data.allItems[type].push(newItem);

      // return the new item
      return newItem;
    },

    calculateBudget: function () {
      // calculate income total
      calculateTotal("exp");
      // calculate expense total
      calculateTotal("inc");
      // subtract expense from income
      data.budget = data.totals.inc - data.totals.exp;
      // calculate percentage of income spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPerc(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
        budget: data.budget,
      };
    },

    test: function () {
      console.log(data);
    },
  };
})();

// User Interface controller
var UIController = (function () {
  var domStrings = {
    inputType: ".type__input",
    inputDescription: ".description__input",
    inputAmount: ".amount__input",
    inputBtn: ".btn__add",
    incomeContainer: ".budget__output-income-lists",
    expenseContainer: ".budget__output-expense-lists",
    budgetValueLabel: ".budget__value",
    incomeValueLabel: ".budget__income-value",
    expenseValueLabel: ".budget__expense-value",
    expensePercentageLabel: ".budget__expense-percentage",
  };

  // Public methods -> methods accessible to the public
  return {
    getInputFields: function () {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        amount: parseFloat(
          document.querySelector(domStrings.inputAmount).value
        ),
      };
    },

    // Add List
    addListItem: function (obj, type) {
      var html, newHtml, container;
      if (type === "inc") {
        container = domStrings.incomeContainer;
        html =
          '<div class="budget__output-income-list" id="income-%id%"><div class="budget__output-income-desc">%description%</div><div class="budget__output-income-list-item"><div class="budget__output-income-val">%amount%</div><button class="btn-delete-icon" role="button"><i class="far fa-times-circle"></i></button></div></div>';
      } else if (type === "exp") {
        container = domStrings.expenseContainer;
        html =
          '<div class="budget__output-expense-list" id="expense-%id%"><div class="budget__output-expense-desc">%description%</div><div class="budget__output-expense-list-item"><div class="budget__output-expense-val">%amount%</div><div class="budget__output-expense-percentage">10%</div><button class="btn-delete-icon" role="button"><i class="far fa-times-circle"></i></button></div></div>';
      }

      // Replace placeholder text
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%amount%", obj.amount);

      // insert the newHtml into the parent container DOM
      document
        .querySelector(container)
        .insertAdjacentHTML("beforeend", newHtml);
    },

    clearFields: function () {
      var fields, fieldsArr;

      // Select all fields with querySelectAll -> returns nodeList
      fields = document.querySelectorAll(
        domStrings.inputDescription + "," + domStrings.inputAmount
      );
      // convert to array by using the .slice.call method
      fieldsArr = Array.prototype.slice.call(fields);
      // loop through the array with forEach
      fieldsArr.forEach(function (current) {
        current.value = "";
      });
      // Focus the element back to the first array item
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      document.querySelector(domStrings.budgetValueLabel).textContent =
        obj.budget;
      document.querySelector(domStrings.incomeValueLabel).textContent =
        obj.totalInc;
      document.querySelector(domStrings.expenseValueLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(domStrings.expensePercentageLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(domStrings.expensePercentageLabel).textContent =
          "--";
      }
    },

    displayPercentages: function () {
      document.querySelector(domStrings.expensePercentageLabel);
    },

    getDomStrings: function () {
      return domStrings;
    },
  };
})();

// App controller code
var appController = (function (budgetCtrl, UICtrl) {
  var setEventListeners = function () {
    var dom = UICtrl.getDomStrings();

    // user clicks the add button
    document.querySelector(dom.inputBtn).addEventListener("click", addItemCtrl);

    //   user clicks the enter key
    document.addEventListener("keypress", function (e) {
      if (e.which === 13 || e.keyCode === 13) {
        addItemCtrl();
      }
    });
  };

  // Delete DOM

  // Changed DOM

  var updateBudget = function () {
    // calculate the budget
    budgetCtrl.calculateBudget();
    // Get all budget
    var budget = budgetCtrl.getBudget();
    // display new budget in the UI
    UICtrl.displayBudget(budget);
  };

  // Update percentages
  var updatePercentages = function () {
    //
  };

  // Update percentages
  // var updatePercentages = function () {};

  var addItemCtrl = function () {
    // Declare variables
    var input, newItem;

    // Get input fields
    input = UICtrl.getInputFields();

    // check if description is not empty, amount contains a number greater than 0
    if (input.description !== "" && input.amount > 0 && !isNaN(input.amount)) {
      // Add item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.amount);

      // Add item to the interface controller
      UICtrl.addListItem(newItem, input.type);

      // Clear fields
      UICtrl.clearFields();

      // calculate and update budget
      updateBudget();

      // calculate and update percentage
      updatePercentages();
    }
  };

  // Delete item ctrl

  // Public methods
  return {
    init: function () {
      console.log("Application had started");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setEventListeners();
    },
  };
})(budgetController, UIController);

// Initialization
appController.init();
