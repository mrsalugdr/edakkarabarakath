const API_URL =
  "https://script.google.com/macros/s/AKfycbzHSlcGVg7EUUJdKf6PoPA0UhJCgbnd78lgy7bYRdGAzYplX7Pj8v8-fA2l4JFWxyGQ/exec";

let customers = [];

const form = document.getElementById("customerForm");
const result = document.getElementById("result");
const recordsContainer = document.getElementById("recordsContainer");
const customerCount = document.getElementById("customerCount");
const searchInput = document.getElementById("searchInput");


document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("receivedDate").value =
    new Date().toISOString().split("T")[0];

  loadCustomers();

});


form.addEventListener("submit", async function (event) {

  event.preventDefault();

  result.className = "";
  result.style.display = "block";
  result.textContent = "Saving customer...";

  const customer = {

    customerName:
      document.getElementById("customerName").value.trim(),

    phone:
      document.getElementById("phone").value.trim(),

    place:
      document.getElementById("place").value.trim(),

    receivedDate:
      document.getElementById("receivedDate").value,

    deliveryDate:
      document.getElementById("deliveryDate").value,

    itemType:
      document.getElementById("itemType").value.trim(),

    quantity:
      document.getElementById("quantity").value,

    measurements:
      document.getElementById("measurements").value.trim(),

    specialNotes:
      document.getElementById("specialNotes").value.trim(),

    stitchingStatus:
      document.getElementById("stitchingStatus").value,

    totalAmount:
      document.getElementById("totalAmount").value,

    advance:
      document.getElementById("advance").value

  };


  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify(customer)

    });


    const text = await response.text();

    console.log(text);

    const data = JSON.parse(text);


    if (!data.success) {

      throw new Error(
        data.error || "Unable to save customer"
      );

    }


    result.className = "success";

    result.textContent =
      "Customer saved successfully! Reference ID: " +
      data.referenceId;


    form.reset();


    document.getElementById("receivedDate").value =
      new Date().toISOString().split("T")[0];

    document.getElementById("quantity").value = "1";


    loadCustomers();


  } catch (error) {

    console.error(error);

    result.className = "error";

    result.textContent =
      "Error: " + error.message;

  }

});


async function loadCustomers() {

  recordsContainer.innerHTML =
    "Loading customers...";


  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify({
        action: "getCustomers"
      })

    });


    const text = await response.text();

    console.log(text);

    const data = JSON.parse(text);


    if (!data.success) {

      throw new Error(
        data.error || "Unable to load customers"
      );

    }


    customers =
      data.customers || [];


    displayCustomers(customers);


  } catch (error) {

    console.error(error);

    recordsContainer.innerHTML =
      "Unable to load customer records.";

  }

}


function displayCustomers(list) {

  customerCount.textContent =
    list.length + " customer(s)";


  if (list.length === 0) {

    recordsContainer.innerHTML =
      "No customer records found.";

    return;

  }


  let html = "";

  html += '<div class="tableWrap">';

  html += '<table class="recordsTable">';

  html += "<thead>";

  html += "<tr>";

  html += "<th>Reference</th>";
  html += "<th>Customer</th>";
  html += "<th>Phone</th>";
  html += "<th>Item</th>";
  html += "<th>Status</th>";
  html += "<th>Balance</th>";
  html += "<th>WhatsApp</th>";

  html += "</tr>";

  html += "</thead>";

  html += "<tbody>";


  list.forEach(function (customer) {

    const balance =
      Number(customer.balance || 0);


    let statusClass =
      "received";


    if (customer.stitchingStatus === "In Progress") {
      statusClass = "progress";
    }

    if (customer.stitchingStatus === "Ready") {
      statusClass = "ready";
    }

    if (customer.stitchingStatus === "Delivered") {
      statusClass = "delivered";
    }


    const phone =
      cleanPhone(customer.phone);


    html += "<tr>";


    html += "<td>";

    html += "<strong>";

    html += escapeHtml(
      customer.referenceId
    );

    html += "</strong>";

    html += "</td>";


    html += "<td>";

    html += escapeHtml(
      customer.customerName
    );

    html += "<br>";

    html += "<small>";

    html += escapeHtml(
      customer.place || ""
    );

    html += "</small>";

    html += "</td>";


    html += "<td>";

    html += escapeHtml(
      customer.phone || ""
    );

    html += "</td>";


    html += "<td>";

    html += escapeHtml(
      customer.itemType || "-"
    );

    html += "</td>";


    html += "<td>";

    html += '<span class="status ' +
      statusClass +
      '">';

    html += escapeHtml(
      customer.stitchingStatus || "Received"
    );

    html += "</span>";

    html += "</td>";


    html += "<td>";

    html += '<span class="' +
      (balance <= 0 ? "paid" : "due") +
      '">';

    html += "₹" +
      balance.toLocaleString("en-IN");

    html += "</span>";

    html += "</td>";


    html += "<td>";

    html += '<button class="whatsapp" ';

    html += 'data-phone="' +
      phone +
      '" ';

    html += 'data-name="' +
      escapeHtml(customer.customerName || "") +
      '" ';

    html += 'data-ref="' +
      escapeHtml(customer.referenceId || "") +
      '">';

    html += "WhatsApp";

    html += "</button>";

    html += "</td>";


    html += "</tr>";

  });


  html += "</tbody>";

  html += "</table>";

  html += "</div>";


  recordsContainer.innerHTML =
    html;


  document
    .querySelectorAll(".whatsapp")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const phone =
            button.getAttribute("data-phone");

          const name =
            button.getAttribute("data-name");

          const reference =
            button.getAttribute("data-ref");


          const message =
            "Hello " +
            name +
            ", this is Edakkara Barakath regarding your stitching order " +
            reference +
            ".";


          const url =
            "https://wa.me/" +
            phone +
            "?text=" +
            encodeURIComponent(message);


          window.open(
            url,
            "_blank"
          );

        }
      );

    });

}


searchInput.addEventListener(
  "input",
  function () {

    const search =
      searchInput.value
        .toLowerCase()
        .trim();


    if (!search) {

      displayCustomers(customers);

      return;

    }


    const filtered =
      customers.filter(function (customer) {

        return (

          String(customer.referenceId || "")
            .toLowerCase()
            .includes(search)

          ||

          String(customer.customerName || "")
            .toLowerCase()
            .includes(search)

          ||

          String(customer.phone || "")
            .toLowerCase()
            .includes(search)

          ||

          String(customer.place || "")
            .toLowerCase()
            .includes(search)

          ||

          String(customer.itemType || "")
            .toLowerCase()
            .includes(search)

        );

      });


    displayCustomers(filtered);

  }
);


document
  .getElementById("refreshBtn")
  .addEventListener(
    "click",
    loadCustomers
  );


function cleanPhone(phone) {

  let value =
    String(phone || "")
      .replace(/\D/g, "");


  if (value.length === 10) {

    value = "91" + value;

  }


  return value;

}


function escapeHtml(value) {

  return String(value || "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}