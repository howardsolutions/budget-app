/************************************************************ */
// Budget Controller
/************************************************************ */

var budgetController = (function () {

    // function constructor
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(( this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    };

    //  CALCULATE TOTAL FUNC

    var calculateTotal = function (type) {

        var sum = 0;

        data.allItems[type].forEach(cur => sum += cur.value);

        data.totals[type] = sum;
    }

    // Data structure
    var data = {

        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentage: -1

    };

    return {
        // create and add new item to data structure 
        addItem: function (type, des, val) {

            var newItem, ID;

            // new ID = LAST ID + 1; each ID is unique
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new Item based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            // push it into our data structure
            data.allItems[type].push(newItem);

            // return new Element
            return newItem;
        },

        deleteItem: function (type, ID) {
            // loops through the Array and get the ID

            // ids = [1 2 4 6 8]
            // index of (6) = 3

            var ids, index;
            ids = data.allItems[type].map(cur => cur.id);

            index = ids.indexOf(ID);

            // use splice methods to remove it from our array
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // Calc TOTAL inc and expenses
            calculateTotal('exp');
            calculateTotal('inc')

            // calc the budget = inc - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Percentage = exp / inc * 100
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {
            // Calculate the percentage for each expenses
            data.allItems.exp.forEach(cur => cur.calcPercentage(data.totals.inc))
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(el => el.getPercentage());
            return allPerc;    
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }

    };

}());


/************************************************************ */
// UI CONTROLLER
/************************************************************ */

var UIController = (function () {

    var DOMstrings = {
        inputTypes: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };

    return {

        getInput: function () {

            return {
                type: document.querySelector(DOMstrings.inputTypes).value, // inc or  exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: Number(document.querySelector(DOMstrings.inputValue).value)
            }

        },

        addListItem: function (obj, type) {

            var html, newHTML, element;
            // Create HTML strings with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div</div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with some actual data from out object
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            // Insert HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            // Convert a Node list to an array.
            fields = document.querySelectorAll(DOMstrings.inputDescription + ' ,' + DOMstrings.inputValue);

            //    fieldsArr =  Array.prototype.slice.call(fields); (ES5)

            fieldsArr = Array.from(fields);

            fieldsArr.forEach(cur => cur.value = "");

            // Set focus back to description field
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentage: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, (cur, index) => {

                if (percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '---';
                }
            });

        },

        displayMonth: function() {
            
            var months, month, year;
            months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec'];    
            month = new Date().getMonth();

              year = new Date().getFullYear();
             document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputTypes + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);
              
                nodeListForEach(fields, cur => {
                    cur.classList.toggle('red-focus')
                });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },

        // formatNumber: function(num, type) {
        //     var numSplit, int, dec;
        //     /*
        //     +, - before number 
        //     exactly 2 decimals points
        //     comma seperating the thousands

        //     2310.456 => + 2,310.46
        //     2000 => 2,000.00

        //      */

        //     num = Math.abs(num);
        //     num = num.toFixed(2);

        //     numSplit = num.split('.')

        //     int = numSplit[0];
        //     if (int.length > 3) {
        //         int = int.subStr(0, 1) + ',' + int.subStr(1,3)
        //     }

        //     dec = numSplit[1];
        // },

        getDOMstrings: function () {
            return DOMstrings;
        }

    }

}) ();


/************************************************************ */
// GLOBAL APP CONTROLLER
/************************************************************ */

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputTypes).addEventListener('change', UICtrl.changedType)

    };

    var updateBudget = function () {

        var budget;
        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the update budget on UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentage = function() {

        // 1. calculate the percentage
        budgetCtrl.calculatePercentage();

        // 2. read percentages from budget controller
       var percentage =  budgetCtrl.getPercentage();

        // 3. update  to the UI with new percentage
        UICtrl.displayPercentage(percentage);
    };

    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();
        // console.log(input)

        if (input.description !== "" && input.value > 0) {

            // 2. Add Items to budget ctrl
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add Items to UI 
            UICtrl.addListItem(newItem, input.type)

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. calculate and update percentage
            updatePercentage();
        };
    };



    var ctrlDeleteItem = function (event) {

        var itemID, splitID, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // inc-1 exp-0
            splitID = itemID.split('-');
            type = splitID[0];
            ID = Number(splitID[1]);

            // 1. delete  item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2 .  delete from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();

              // 4. calculate and update percentage
              updatePercentage();

        }
    }


    return {
        init: function () {
            // Set everything in DOM to 0 when the game start at the beginning
            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListeners();
        }
    };


})(budgetController, UIController);

// Call the init function when the game start 
controller.init()