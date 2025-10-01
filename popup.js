const CLIENT_ID = "d70305e7c3ac5c6"; // 建议换成你自己的
const fileInput = document.getElementById("fileInput");
const fileNameDiv = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const preview = document.getElementById("preview");
const toast = document.getElementById("toast");

let clipboardFile = null; // 存储从剪贴板来的文件

// 选择文件时
fileInput.addEventListener("change", () => {
  clipboardFile = null; // 清空剪贴板文件
  if (!fileInput.files.length) {
    fileNameDiv.style.display = "none";
    return;
  }
  fileNameDiv.style.display = "block";
  fileNameDiv.textContent = "已选择: " + fileInput.files[0].name;
});

// 显示提示
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

// 上传函数
async function upload(file) {
  if (!file) {
    alert("请选择一张图片或粘贴图片");
    return;
  }

  const form = new FormData();
  form.append("image", file);

  uploadBtn.disabled = true;
  uploadBtn.textContent = "上传中...";

  try {
    const res = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: { Authorization: "Client-ID " + CLIENT_ID },
      body: form
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.data.error);

    const id = data.data.id;
    const ext = data.data.type.includes("png") ? "png" : "jpeg";
    const link = `https://i.imgur.com/${id}.${ext}`;

    preview.innerHTML = "";
    const linkBox = document.createElement("div");
    linkBox.className = "link-box";

    const linkText = document.createElement("div");
    linkText.className = "link-text";
    linkText.textContent = link;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "复制";
    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(link);
      copyBtn.textContent = "已复制";
      showToast("直链已复制");
      setTimeout(() => (copyBtn.textContent = "复制"), 1200);
    };

    linkBox.appendChild(linkText);
    linkBox.appendChild(copyBtn);
    preview.appendChild(linkBox);

    const img = document.createElement("img");
    img.className = "preview-img";
    img.src = link;
    preview.appendChild(img);
  } catch (e) {
    alert("上传失败: " + e.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "上传";
  }
}

// 点击上传按钮
uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0] || clipboardFile;
  upload(file);
});

// 监听粘贴事件
document.addEventListener("paste", (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith("image")) {
      const file = item.getAsFile();
      clipboardFile = file;
      fileNameDiv.style.display = "block";
      fileNameDiv.textContent = "已从剪贴板获取图片: " + file.name;
      showToast("已从剪贴板获取图片");
      break;
    }
  }
});
