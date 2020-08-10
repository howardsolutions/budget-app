// modules pattern simply uses the concept of Closures and IIFE. 

// BUDGET CONTROLLER

var budgetController = (function () {
    // function constructor for exp and inc
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    }

    // create a data structure 
    var data = {

        allItems: {
            inc: [],
            exp: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1,


    };

    // create a public method allow other module to add new items to data structure 

    return {

        addItem: function (type, des, val) {
            var newItem, ID;

            // ID = last ID  + 1
            // We want to select the last ID of array.
            // Create new ID

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new items based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }
            // Push it into our data structure 
            data.allItems[type].push(newItem);

            // Return new Item
            return newItem;

        },

        calculateBudget: function() {

            // Calculate the total of income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; //  === not exist the percentage
            }

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage:data.percentage
            } 
        },

        testing: function () {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLable: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    }

    return {

        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {

            var html, newHTML, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual  data (receipt from object)
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value)

            // Insert HTML to the DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearField: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // Convert a list into an  array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            })

            //   set the focus to the description at the end 
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLable).textContent = obj.totalExp;

            if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';   
            }

        },

        getDOMstrings: function () {
            return DOMstrings;
        }

    }

})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListener = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItems);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 && event.which === 13) {
                ctrlAddItems();
            }
        })
    };

    var updateBudget = function () {

        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return the budget
        var budget =  budgetCtrl.getBudget();
        
        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItems = function () {
        var input, newItem;

        // 1. get input from the field (from user)
        input = UICtrl.getInput();
        
        // right here we use the opposite operator (!)

        if (input.description !== " " && !isNaN(input.value) && input.value > 0) {

            // 2. add new items to the budget controller. 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add new items to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the field 
            UICtrl.clearField();

            //5. calculate and update the budget
            updateBudget();
        }

    };

    return {
        init: function () {
            console.log('Test!!!');
            UICtrl.displayBudget( {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage:-1
            } );
            setupEventListener()
        } 
    }

})(budgetController, UIController);

controller.init();







