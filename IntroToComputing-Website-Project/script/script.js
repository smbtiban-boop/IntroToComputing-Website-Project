// localStorage helpers (wrapped so the site still works if storage is blocked)
function store(key, value) {
    try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (err) {}
}

function load(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
}

// Challenge #11: Tabs
function openTab(evt, name) {
    var i, content = document.getElementsByClassName("tabcontent"),
        links = document.getElementsByClassName("tablink");
    for (i = 0; i < content.length; i++) { content[i].style.display = "none"; }
    for (i = 0; i < links.length; i++) { links[i].className = links[i].className.replace(" active", ""); }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}

// Challenge #11: Modal box
function openModal() {
    document.getElementById("p-name").value = document.getElementById("profileName").textContent;
    var y = document.getElementById("profileYear").textContent,
        e = document.getElementById("profileEmail").textContent;
    if (y !== "-") { document.getElementById("p-year").value = y; }
    document.getElementById("p-email").value = e === "-" ? "" : e;
    document.getElementById("modal").style.display = "block";
}

function closeModal() { document.getElementById("modal").style.display = "none"; }
window.onclick = function(e) { if (e.target == document.getElementById("modal")) { closeModal(); } };

// Challenge #11: Collapsible
var coll = document.getElementsByClassName("collapsible");
for (var c = 0; c < coll.length; c++) {
    coll[c].addEventListener("click", function() {
        var content = this.nextElementSibling;
        content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
    });
}

// Challenge #11: Progress bar
window.addEventListener("load", function() {
    var bar = document.getElementById("bar");
    bar.style.width = "60%";
    bar.innerHTML = "60%";
});

// Challenge #12: Toggle dark mode and theme buttons
function updateDarkLabel() {
    document.getElementById("darkBtn").innerHTML =
        document.body.classList.contains("dark") ? "Light mode" : "Dark mode";
}

function toggleDark() {
    document.body.classList.remove("light");
    document.body.classList.toggle("dark");
    updateDarkLabel();
    store("mycampus_theme", document.body.classList.contains("dark") ? "dark" : "");
}

function setTheme(name) {
    document.body.classList.remove("dark", "light");
    if (name) { document.body.classList.add(name); }
    updateDarkLabel();
    store("mycampus_theme", name);
}

// Challenge #12: Filter table
function filterTable() {
    var filter = document.getElementById("search").value.toUpperCase();
    var rows = document.getElementById("gradesTable").tBodies[0].rows;
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = rows[i].textContent.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    }
}

// Challenge #12: Sort table
function sortTable(n) {
    var table = document.getElementById("gradesTable"),
        body = table.tBodies[0];
    var rows = Array.prototype.slice.call(body.rows);
    var asc = table.getAttribute("data-dir") !== "asc";
    rows.sort(function(a, b) {
        var x = a.cells[n].textContent,
            y = b.cells[n].textContent;
        if (!isNaN(x) && !isNaN(y)) {
            x = parseFloat(x);
            y = parseFloat(y);
        }
        return (x > y ? 1 : x < y ? -1 : 0) * (asc ? 1 : -1);
    });
    for (var i = 0; i < rows.length; i++) { body.appendChild(rows[i]); }
    table.setAttribute("data-dir", asc ? "asc" : "desc");
}

// Challenge #12: Close alert
function closeAlert() { document.getElementById("alert").style.display = "none"; }

// Challenge #12: Back to top button
window.onscroll = function() {
    document.getElementById("topBtn").style.display = window.scrollY > 100 ? "block" : "none";
};

function goTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

// Menu navigation: show only the section that was clicked
function showSection() {
    var id = location.hash.replace("#", ""),
        i, found = false;
    var sections = document.getElementsByClassName("section");
    var links = document.querySelectorAll("#nav-list a");
    for (i = 0; i < sections.length; i++) { if (sections[i].id === id) { found = true; } }
    if (!found) { id = "home"; }
    for (i = 0; i < sections.length; i++) {
        sections[i].className = "section" + (sections[i].id === id ? " visible" : "");
    }
    for (i = 0; i < links.length; i++) {
        links[i].className = links[i].getAttribute("href") === "#" + id ? "active" : "";
    }
    window.scrollTo(0, 0);
}
document.body.className += " js";
window.addEventListener("hashchange", showSection);
showSection();

// Add a subject (Grades form) and refresh the Dashboard numbers
function updateDashboard() {
    var rows = document.getElementById("gradesTable").tBodies[0].rows,
        credits = 0,
        points = 0,
        i, c, g;
    for (i = 0; i < rows.length; i++) {
        c = parseFloat(rows[i].cells[2].textContent);
        g = parseFloat(rows[i].cells[3].textContent);
        credits += c;
        points += c * g;
    }
    var gpa = credits ? points / credits : 0;
    document.getElementById("gpaValue").innerHTML = credits ? gpa.toFixed(2) : "-";
    document.getElementById("creditsValue").innerHTML = credits;
    document.getElementById("classesValue").innerHTML = rows.length;
    document.getElementById("standingValue").innerHTML = !credits ? "-" : gpa <= 1.75 ? "Excellent" : gpa <= 2.5 ? "Good" : gpa <= 3 ? "Passing" : "Needs attention";
}

function addSubject() {
    var code = document.getElementById("g-code").value.trim(),
        subject = document.getElementById("g-subject").value.trim(),
        credits = parseInt(document.getElementById("g-credits").value, 10),
        grade = parseFloat(document.getElementById("g-grade").value),
        msg = document.getElementById("grade-msg");
    msg.className = "msg error";
    if (!code || !subject) { msg.innerHTML = "Please enter the course code and subject name."; return false; }
    if (isNaN(credits) || credits < 1 || credits > 6) { msg.innerHTML = "Credits must be from 1 to 6."; return false; }
    if (isNaN(grade) || grade < 1 || grade > 5) { msg.innerHTML = "Grade must be from 1.00 to 5.00."; return false; }
    var body = document.getElementById("gradesTable").tBodies[0],
        row = body.insertRow(-1),
        values = [code, subject, credits, grade.toFixed(2)];
    for (var i = 0; i < values.length; i++) { row.insertCell(i).textContent = values[i]; }
    updateDashboard();
    saveSubjects();
    msg.className = "msg ok";
    msg.innerHTML = "Subject added.";
    document.getElementById("g-code").value = "";
    document.getElementById("g-subject").value = "";
    document.getElementById("g-credits").value = "";
    document.getElementById("g-grade").value = "";
    return false;
}


// ===== Saving with localStorage =====
function saveSubjects() {
    var rows = document.getElementById("gradesTable").tBodies[0].rows,
        list = [];
    for (var i = 0; i < rows.length; i++) {
        list.push([rows[i].cells[0].textContent, rows[i].cells[1].textContent,
            rows[i].cells[2].textContent, rows[i].cells[3].textContent
        ]);
    }
    store("mycampus_subjects", list);
}

function saveProfile() {
    var name = document.getElementById("p-name").value.trim(),
        year = document.getElementById("p-year").value,
        email = document.getElementById("p-email").value.trim();
    if (name) { document.getElementById("profileName").textContent = name; }
    document.getElementById("profileYear").textContent = year;
    document.getElementById("profileEmail").textContent = email || "-";
    store("mycampus_profile", { name: name, year: year, email: email });
    closeModal();
    return false;
}

function resetData() {
    if (!confirm("Remove all saved subjects, profile, and theme?")) { return; }
    try {
        localStorage.removeItem("mycampus_subjects");
        localStorage.removeItem("mycampus_profile");
        localStorage.removeItem("mycampus_theme");
    } catch (err) {}
    location.reload();
}

function loadSaved() {
    var data;
    try {
        data = JSON.parse(load("mycampus_subjects"));
        if (data && data.length) {
            var body = document.getElementById("gradesTable").tBodies[0];
            body.innerHTML = "";
            for (var i = 0; i < data.length; i++) {
                var row = body.insertRow(-1);
                for (var k = 0; k < 4; k++) { row.insertCell(k).textContent = data[i][k]; }
            }
            updateDashboard();
        }
        data = JSON.parse(load("mycampus_profile"));
        if (data) {
            if (data.name) { document.getElementById("profileName").textContent = data.name; }
            document.getElementById("profileYear").textContent = data.year || "-";
            document.getElementById("profileEmail").textContent = data.email || "-";
        }
    } catch (err) {}
    var theme = load("mycampus_theme");
    if (theme) { setTheme(theme); }
}
loadSaved();