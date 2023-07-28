(function () {
  let todoItemList = [],
    listName = "";

  // генератор уникального id
  function getNewId() {
    let maxNum = 0;

    for (let item of todoItemList) {
      if (item.id > maxNum) {
        maxNum = item.id;
      }
    }

    return maxNum + 1;
  }

  // создаём и возвращаем загловок приложения
  function createAppTitle(title) {
    let appTitle = document.createElement("h2");
    appTitle.innerHTML = title;
    return appTitle;
  }

  // создаем и возвращаем форму для создания дела
  function createTodoItemForm() {
    // создаем элемент формы, поля ввода, обертки для кнопки и кнопки
    let form = document.createElement("form");
    let input = document.createElement("input");
    let buttonWrapper = document.createElement("div");
    let button = document.createElement("button");

    // добавим атрибуты созданным элементам
    // используем классы Bootstrap для стилизации
    form.classList.add("input-group", "mb-3");
    input.classList.add("form-control");
    input.placeholder = "Введите название нового дела";
    // класс для позиционирования элемента в форме справа от поля для ввода
    buttonWrapper.classList.add("input-group-append");
    button.classList.add("btn", "btn-primary");
    button.disabled = true;
    button.textContent = "Добавить дело";

    // объединяем DOM элементы в единую структуру (вкладываем элементы)
    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    input.addEventListener("input", function () {
      if (input.value !== "") {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    });

    // нельзя вернуть просто форму, так как нам отдельно нужен доступ и к полю, и к кнопке
    return {
      form,
      input,
      button,
    };
  }

  // создаем и возварщаем список элементов
  function createTodoList() {
    let list = document.createElement("ul");
    list.classList.add("list-group");
    return list;
  }

  // функция создания DOM элемента с делом и возвращающая все необходимое для взаимодействия с этим элементом
  function createTodoItem(todoItemObj) {
    // создаем элемент списка, блок для кнопок и две кнопки
    // кнопки помещаем в элемент, который красиво покажет их в одной группе
    let item = document.createElement("li");
    let buttonGroup = document.createElement("div");
    let doneButton = document.createElement("button");
    let deleteButton = document.createElement("button");

    // устанавливаем стили для элемента списка, а также для размещения кнопок
    // в его правой части с помощью flex
    item.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    item.textContent = todoItemObj.name;

    // добавляем текст, Bootstrap классы кнопкам и их группе
    buttonGroup.classList.add("btn-group", "btn-group-sm");
    doneButton.classList.add("btn", "btn-success");
    doneButton.textContent = "Готово";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.textContent = "Удалить";

    if (todoItemObj.done === true) {
      item.classList.add("list-group-item-success");
    }

    // добавляем обработчики на кнопки
    doneButton.addEventListener("click", function () {
      item.classList.toggle("list-group-item-success");

      for (let listItem of todoItemList) {
        if (listItem.id === todoItemObj.id) {
          listItem.done = !listItem.done;
        }
      }

      saveList(listName);
    });
    deleteButton.addEventListener("click", function () {
      if (confirm("Вы уверены?")) {
        item.remove();

        for (let i = 0; i < todoItemList.length; i++) {
          if (todoItemList[i].id === todoItemObj.id) {
            todoItemList.splice(i, 1);
          }
        }

        saveList(listName);
      }
    });

    // вкладываем кнопки в отдельный элемент, а этот элемент в item
    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    // приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
    return {
      item,
      doneButton,
      deleteButton,
    };
  }

  function saveList(keyName) {
    localStorage.setItem(keyName, JSON.stringify(todoItemList));
  }

  // главная функция создания приложеня
  function createTodoApp(container, title = "Список дел", keyName) {
    // вызываем 3 функции создания
    // 1 и 3 вернут DOM элемент
    // во 2 мы возварщаем объект (в котором помимо прочего есть form)
    let todoAppTitle = createAppTitle(title);
    let todoItemForm = createTodoItemForm();
    let todoList = createTodoList();

    listName = keyName;

    // результа работы функций размещаем внутри контейнера (который передается из файла .html)
    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    let localData = localStorage.getItem(listName);

    if (localData !== null && localData !== "") {
      todoItemList = JSON.parse(localData);
    }

    for (let itemList of todoItemList) {
      let todoItem = createTodoItem(itemList);
      todoList.append(todoItem.item);
    }

    // браузер создает событие submit на форме по нажатию на Enter или на кнопку создания дела
    todoItemForm.form.addEventListener("submit", function (e) {
      // предотвращает стандартное действие браузера
      // в данном случае мы не хотим, чтобы страница перезагружалась при отправке формы
      e.preventDefault();

      // игнорируем создание элемнетна, есил пользователь ничего не ввел в поле
      if (!todoItemForm.input.value) {
        return;
      }

      let newTodoItem = {
        id: getNewId(),
        name: todoItemForm.input.value,
        done: false,
      };

      todoItemList.push(newTodoItem);
      saveList(listName);

      // создаем и добавляем в список новое дело с названием из поля для ввода
      let todoItem = createTodoItem(newTodoItem);

      // создаем и добавляем в список новое дело с названием из поля для ввода
      todoList.append(todoItem.item);

      todoItemForm.button.disabled = true;

      // обнуляем значение в поле, чтобы не пришлось стирать его вручную
      todoItemForm.input.value = "";
    });
  }

  // явно регистрируем функцию createTodoApp в глобальном объекте window чтобы получить доступ к этой функци из других скриптов
  // пока мы не знаем других способов, сделаем так
  window.createTodoApp = createTodoApp;
})();
