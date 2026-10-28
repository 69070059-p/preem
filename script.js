// ============================================================
//  To-do List  |  script.js
//  รับคิดการ: เพิ่มข้อความ / ลบข้อความ / บันทึกลง Local Storage
//  ไม่แก้ไข CSS หรือโครงสร้างของหน้าเว็บ
// ============================================================

(function () {
    "use strict";

    // ---- คีย์สำหรับเก็บข้อมูลใน Local Storage ----
    const STORAGE_KEY = "todoTasks";

    // ---- ดึง Element จาก id ที่มีอยู่ใน index.html ----
    const todoInput = document.getElementById("todo-input") || document.getElementById("todoInput");
    const addBtn = document.getElementById("add-btn") || document.getElementById("addBtn");
    const todoList = document.getElementById("todoList");

    // ถ้าไม่พบ Element ที่จำเป็น ก็ไม่ต้องทำอะไรต่อ
    if (!todoInput || !addBtn || !todoList) {
        console.warn("To-do List: ไม่พบ Element ที่จำเป็น (todo-input, add-btn, todoList)");
        return;
    }

    // ---- ข้อมูลรายการทั้งหมด (เก็บ id แยกไว้ ลบได้ถูกต้นแม้ข้อความซ้ำ) ----
    let tasks = [];

    // ---- สร้าง id สั้น ๆ สำหรับรายการ ----
    let idCounter = 0;
    function makeId() {
        idCounter += 1;
        return "task-" + Date.now() + "-" + idCounter;
    }

    // ---- บันทึกข้อมูลลง Local Storage ----
    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (err) {
            console.warn("To-do List: บันทึก Local Storage ไม่สำเร็จ", err);
        }
    }

    // ---- อ่านข้อมูลจาก Local Storage ----
    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return null;
            return parsed.map(function (item) {
                // รองรับทั้งรูปแบบ ["งาน1"] และ [{id, text}]
                if (typeof item === "string") {
                    return { id: makeId(), text: item };
                }
                return { id: item.id || makeId(), text: String(item.text || "") };
            });
        } catch (err) {
            console.warn("To-do List: อ่าน Local Storage ไม่สำเร็จ", err);
            return null;
        }
    }

    // ---- สร้าง <li> พร้อมข้อความและปุ่มลบ (เหมือนรายการเดิมในหน้าเว็บ) ----
    function createLiElement(task) {
        const li = document.createElement("li");

        const span = document.createElement("span");
        span.textContent = task.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "X";
        deleteBtn.addEventListener("click", function () {
            deleteTask(task.id);
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        return li;
    }

    // ---- วาดรายการทั้งหมดลงใน <ul> ----
    function renderTasks() {
        todoList.innerHTML = "";
        tasks.forEach(function (task) {
            todoList.appendChild(createLiElement(task));
        });
    }

    // ---- เพิ่มรายการใหม่ ----
    function addTask() {
        const text = todoInput.value.trim();

        // ถ้าพิมพ์เปล่า ไม่ต้องทำอะไร
        if (text === "") {
            todoInput.focus();
            return;
        }

        tasks.push({ id: makeId(), text: text });
        saveTasks();
        renderTasks();

        // ล้างช่องพิมพ์ให้ว่าง
        todoInput.value = "";
        todoInput.focus();
    }

    // ---- ลบรายการออก ----
    function deleteTask(id) {
        tasks = tasks.filter(function (task) {
            return task.id !== id;
        });
        saveTasks();
        renderTasks();
    }

    // ---- ดักจับการกดปุ่ม "เพิ่ม" ----
    addBtn.addEventListener("click", addTask);

    // ---- กด Enter ในช่องพิมพ์เพื่อเพิ่มรายการ ----
    todoInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addTask();
        }
    });

    // ---- เริ่มต้น: ดึงข้อมูลเดิมจาก Local Storage (ถ้ามี) มาแสดงผล ----
    function init() {
        const saved = loadTasks();

        if (saved) {
            // มีข้อมูลเคยบันทึกไว้ -> ใช้ข้อมูลนั้น
            tasks = saved;
        } else {
            // ยังไม่เคยบันทึก -> เอารายการที่มีอยู่ในหน้าเว็บตอนแรกมาเป็นข้อมูลเริ่มต้น
            const existingItems = todoList.querySelectorAll("li");
            existingItems.forEach(function (li) {
                const span = li.querySelector("span");
                const text = span ? span.textContent.trim() : li.textContent.trim();
                if (text !== "") {
                    tasks.push({ id: makeId(), text: text });
                }
            });
            saveTasks();
        }

        renderTasks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
