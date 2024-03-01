// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  let currentDate = new Date();
  let deadlineDate = new Date(task.deadline);

  // Calculate the difference in days between current date and deadline date
  let differenceInDays = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));

  // Set the background color based on the deadline proximity
  let backgroundColor = differenceInDays <= 0 ? "white" : differenceInDays <= 3 ? "blue" : "";

  // Add a class to the card based on the background color
  let cardClass = "card task-card mb-3";
  if (backgroundColor === "red") {
    cardClass += " red-background";
  }

  return `
    <div class="${cardClass}" id="task-${task.id}" data-id="${task.id}" style="background-color: ${backgroundColor};">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><strong>Deadline:</strong> ${task.deadline}</p>
        <button type="button" class="btn btn-danger delete-task-btn"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    let card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  // Make task cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone"
  });

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Add event listener for deleting tasks
  $(".delete-task-btn").click(handleDeleteTask);
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  let title = $("#taskTitle").val().trim(); // Trim whitespace
  let description = $("#taskDescription").val();
  let deadline = $("#taskDeadline").val();

  // Basic validation to ensure title is not empty
  if (title === "") {
    alert("Please enter a title for the task.");
    return;
  }

  let newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    deadline: deadline,
    status: "todo" // Initial status is "To Do"
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);

  $("#formModal").modal("hide");
  renderTaskList();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  let taskId = $(event.target).closest(".task-card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let taskId = ui.draggable.data("id");
  let newStatus = $(this).attr("id");
  let taskIndex = taskList.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    console.error("Task not found!");
    return;
  }

  taskList[taskIndex].status = newStatus;
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to initialize date picker for the task deadline field
function initializeDatePicker() {
  $("#taskDeadline").datepicker({
    dateFormat: "yy-mm-dd", // Date format (YYYY-MM-DD)
    minDate: 0, // Minimum selectable date (today)
    changeMonth: true,
    changeYear: true
  });
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and initialize date picker
$(document).ready(function () {
  renderTaskList();
  initializeDatePicker();

  $("#taskForm").submit(handleAddTask);
});
