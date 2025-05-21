// Переключение между загрузкой файла и ручной формой
document.getElementById('uploadBtn').addEventListener('click', function () {
    document.getElementById('predictForm').style.display = 'block';
    document.getElementById('manualForm').style.display = 'none';
    document.getElementById('uploadBtn').classList.add('active');
    document.getElementById('fillBtn').classList.remove('active');
  });
  
  document.getElementById('fillBtn').addEventListener('click', function () {
    document.getElementById('predictForm').style.display = 'none';
    document.getElementById('manualForm').style.display = 'block';
    document.getElementById('fillBtn').classList.add('active');
    document.getElementById('uploadBtn').classList.remove('active');
  });
  
  // Отправка формы с ручным вводом
  document.getElementById('manualForm').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const formData = new FormData(this);
  
    fetch('/predict_form', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          document.getElementById('errorDiv').innerHTML = data.error;
          document.getElementById('errorDiv').style.display = 'block';
        } else {
          showResult(data.prediction, data.probability);
        }
      })
      .catch(error => {
        document.getElementById('errorDiv').innerHTML = "Ошибка при обработке данных";
        document.getElementById('errorDiv').style.display = 'block';
      });
  });
  
  // Загрузка файла и отправка
  document.getElementById('fileInput').addEventListener('change', function () {
    const formData = new FormData();
    formData.append('file', this.files[0]);
  
    fetch('/predict_file', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          document.getElementById('errorDiv').innerHTML = data.error;
          document.getElementById('errorDiv').style.display = 'block';
        } else {
          showResult(data.prediction, data.probability);
        }
      })
      .catch(error => {
        document.getElementById('errorDiv').innerHTML = "Ошибка при обработке файла";
        document.getElementById('errorDiv').style.display = 'block';
      });
  });
  
  // Показываем результат и сохраняем в sessionStorage
  function showResult(predictions, probabilities) {
    document.getElementById('errorDiv').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    const resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = '';
  
    sessionStorage.setItem('predictions', JSON.stringify(predictions));
    sessionStorage.setItem('probabilities', JSON.stringify(probabilities));
  
    predictions.forEach((pred, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${pred}</td>
        <td>${probabilities[idx]}</td>
      `;
      resultTableBody.appendChild(row);
    });
  }
  
  // Скачивание CSV
  function downloadCSV() {
    const predictions = JSON.parse(sessionStorage.getItem('predictions'));
    const probabilities = JSON.parse(sessionStorage.getItem('probabilities'));
  
    if (!predictions || !probabilities) {
      alert('Нет данных для скачивания.');
      return;
    }
  
    let csvContent = '№,Предсказание,Уверенность\n';
    predictions.forEach((pred, idx) => {
      csvContent += `${idx + 1},${pred},${probabilities[idx]}\n`;
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Скачивание JSON
  function downloadJSON() {
    const predictions = JSON.parse(sessionStorage.getItem('predictions'));
    const probabilities = JSON.parse(sessionStorage.getItem('probabilities'));
  
    if (!predictions || !probabilities) {
      alert('Нет данных для скачивания.');
      return;
    }
  
    const jsonData = JSON.stringify({
      prediction: predictions,
      probability: probabilities
    }, null, 2);
  
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Назначаем функции на кнопки (если не через HTML)
  document.getElementById('exportCsvButton').addEventListener('click', downloadCSV);
  document.getElementById('exportJsonButton').addEventListener('click', downloadJSON);
  
  // Назначаем кнопку назад
  document.getElementById('backIndexButton').addEventListener('click', function () {
    document.getElementById('result').style.display = 'none';
  });
  
  // По умолчанию активна форма загрузки
  document.getElementById('uploadBtn').click();
