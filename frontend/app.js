// Define the AngularJS app
var app = angular.module('taskApp', []);

// Define the Controller — this is the brain of front-end
app.controller('TaskController', function($scope, $http) {

    // The URL of C# API
    var apiUrl = 'http://localhost:5245/api/tasks';

    // ─────────────────────────────────────────
    // FILTER state
    // ─────────────────────────────────────────
    $scope.currentFilter = 'all'; // Default filter is "All"
    $scope.filteredTasks = [];

    // This function runs every time filter or tasks change
    function applyFilter() {
        if ($scope.currentFilter === 'all') {
            $scope.filteredTasks = $scope.tasks;
        } else if ($scope.currentFilter === 'active') {
            $scope.filteredTasks = $scope.tasks.filter(function(t) {
                return !t.isCompleted;
            });
        } else if ($scope.currentFilter === 'completed') {
            $scope.filteredTasks = $scope.tasks.filter(function(t) {
                return t.isCompleted;
            });
        }
    }

    // Called when a filter button is clicked
    $scope.setFilter = function(filter) {
        $scope.currentFilter = filter;
        applyFilter();
    };

    // ─────────────────────────────────────────
    // Check if a task is overdue
    // ─────────────────────────────────────────
    $scope.isOverdue = function(task) {
        if (!task.dueDate || task.isCompleted) return false;
        return new Date(task.dueDate) < new Date();
    };

    // ─────────────────────────────────────────
    // LOAD all tasks
    // ─────────────────────────────────────────
    function loadTasks() {
        $http.get(apiUrl)
            .then(function(response) {
                // response.data contains the JSON array from the API
                $scope.tasks = response.data;
                applyFilter(); // Apply filter after loading
            })
            .catch(function(error) {
                console.error('Error loading tasks:', error);
            });
    }

    // ─────────────────────────────────────────
    // ADD a new task
    // ─────────────────────────────────────────
    $scope.addTask = function() {
        // Don't add empty tasks
        if (!$scope.newTaskTitle || $scope.newTaskTitle.trim() === '') return;

        var newTask = {
            title: $scope.newTaskTitle,
            isCompleted: false,
            dueDate: $scope.newTaskDueDate ? new Date($scope.newTaskDueDate).toISOString() : null
        };

        // POST request: send the new task to the API
        $http.post(apiUrl, newTask)
            .then(function(response) {
                $scope.tasks.push(response.data); // Add to the list immediately
                $scope.newTaskTitle = '';          // Clear the input box
                $scope.newTaskDueDate = '';
                applyFilter(); // Reapply filter after adding
            })
            .catch(function(error) {
                console.error('Error adding task:', error);
            });
    };

    // ─────────────────────────────────────────
    // TOGGLE task complete/incomplete
    // ─────────────────────────────────────────
    $scope.toggleComplete = function(task) {
        task.isCompleted = !task.isCompleted;

        // PUT request: update the task in the API
        $http.put(apiUrl + '/' + task.id, task)
            .then(function() {
                applyFilter(); // Reapply filter so task moves to correct group
            })
            .catch(function(error) {
                // Revert if API call fails
                task.isCompleted = !task.isCompleted;
                console.error('Error updating task:', error);
            });
    };

    // ─────────────────────────────────────────
    // EDIT a task
    // ─────────────────────────────────────────
    $scope.startEdit = function(task) {
        task.editing = true;
        task._originalTitle = task.title; // Save original in case user cancels
    };

    // ─────────────────────────────────────────
    // SAVE edited task
    // ─────────────────────────────────────────
    $scope.saveEdit = function(task) {
        task.editing = false;

        // PUT request: send the updated task to the API
        $http.put(apiUrl + '/' + task.id, task)
            .catch(function(error) {
                task.title = task._originalTitle; // Revert title if save failed
                console.error('Error saving task:', error);
            });
    };

    // ─────────────────────────────────────────
    // DELETE a task
    // ─────────────────────────────────────────
    $scope.deleteTask = function(taskId) {
        // DELETE request: tell the API to remove this task
        $http.delete(apiUrl + '/' + taskId)
            .then(function() {
                // Remove from the local list too
                $scope.tasks = $scope.tasks.filter(function(t) {
                    return t.id !== taskId;
                });
                applyFilter(); // Reapply filter after deleting
            })
            .catch(function(error) {
                console.error('Error deleting task:', error);
            });
    };

    // Load tasks immediately when the page loads
    loadTasks();
});