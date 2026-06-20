function addReport() {
  const title = document.getElementById("title").value;
  const location = document.getElementById("location").value;
  const desc = document.getElementById("desc").value;

  const list = document.getElementById("list");

  const item = document.createElement("li");
  item.innerText = `${title} | ${location} | ${desc}`;

  list.appendChild(item);

  // 입력창 초기화
  document.getElementById("title").value = "";
  document.getElementById("location").value = "";
  document.getElementById("desc").value = "";
}