const API_URL =
  "https://script.google.com/macros/s/AKfycbzHSlcGVg7EUUJdKf6PoPA0UhJCgbnd78lgy7bYRdGAzYplX7Pj8v8-fA2l4JFWxyGQ/exec";

let allCustomers = [];

const recordsContainer = document.getElementById("recordsContainer");
const customerCount = document.getElementById("customerCount");
const searchInput = document.getElementById("searchInput");
const customerForm = document.getElementById("customerForm");
const resultBox = document.getElementById("result");
const refreshBtn = document.getElementById("refreshBtn");


// ===============================
// LOAD CUSTOMERS
// ===============================

async function loadCustomers() {

  recordsContainer.innerHTML = "Loading customers...";
  customerCount.textContent = "Loading...";

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

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Unable to load customers");
    }

    allCustomers = result.customers || [];

    renderCustomers(allCustomers);

  } catch (error) {

    console.error("Load error:", error);

    recordsContainer.innerHTML = `
      <div class="error">
        <strong>Unable to load customers.</strong>
        <br><br>
        ${escapeHtml(error.message)}
        <br><br>
        Please check the Google Apps Script connection.
      </div>
    `;

    customerCount.textContent = "Error";

  }

}


// ===============================
// DISPLAY CUSTOMERS
// ===============================

function renderCustomers(customers) {

  customerCount.textContent =
    `${customers.length} customer${customers.length === 1 ? "" : "s"}`;

  if (!customers.length) {

    recordsContainer.innerHTML = `
      <div class="empty">
        No customer records found.
      </div>
    `;

    return;
  }


  recordsContainer.innerHTML = customers.map(customer => {

    const phone = formatPhone(customer.phone);

    const whatsappMessage = encodeURIComponent(
`Hello ${customer.customerName || ""},

Your stitching order is ready.

Reference Code: ${customer.referenceId || ""}

Thank you,
EDAkkara Barakath`
    );

    const whatsappUrl =
      `https://wa.me/${phone}?text=${whatsappMessage}`;


    return `
      <div class="customer-card">

        <div class="customer-header">

          <strong>
            ${escapeHtml(customer.referenceId)}
          </strong>

          <span class="status">
            ${escapeHtml(customer.stitchingStatus || "Received")}
          </span>

        </div>


        <h3>
          ${escapeHtml(customer.customerName || "")}
        </h3>


        <p>
          📞 ${escapeHtml(customer.phone || "")}
        </p>


        <p>
          📍 ${escapeHtml(customer.place || "")}
        </p>


        <p>
          👗 ${escapeHtml(customer.itemType || "")}
        </p>


        <p>
          🔢 Quantity:
          ${escapeHtml(customer.quantity || "1")}
        </p>


        <p>
          📅 Received:
          ${escapeHtml(formatDate(customer.receivedDate))}
        </p>


        ${
          customer.deliveryDate
            ? `
              <p>
                📦 Delivery:
                ${escapeHtml(formatDate(customer.deliveryDate))}
              </p>
            `
            : ""
        }


        ${
          customer.totalAmount
            ? `
              <p>
                💰 Total:
                ₹${escapeHtml(customer.totalAmount)}
              </p>
            `
            : ""
        }


        ${
          customer.balance
            ? `
              <p>
                💵 Balance:
                ₹${escapeHtml(customer.balance)}
              </p>
            `
            : ""
        }


        ${
          customer.measurements
            ? `
              <p>
                📏 Measurements:
                ${escapeHtml(customer.measurements)}
              </p>
            `
            : ""
        }


        ${
          customer.specialNotes
            ? `
              <p>
                📝 ${escapeHtml(customer.specialNotes)}
              </p>
            `
            : ""
        }


        <div class="customer-actions">

          <a
            class="whatsapp-button"
            href="${whatsappUrl}"
            target="_blank"
            rel="noopener"
          >
            WhatsApp
          </a>

        </div>

      </div>
    `;

  }).join("");

}


// ===============================
// SAVE CUSTOMER
// ===============================

customerForm.addEventListener("submit", async function(event) {

  event.preventDefault();

  const saveButton =
    customerForm.querySelector("button[type='submit']");

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  resultBox.innerHTML = "";


  const customerData = {

    action: "saveCustomer",

    customerName:
      getValue("customerName"),

    phone:
      getValue("phone"),

    place:
      getValue("place"),

    receivedDate:
      getValue("receivedDate"),

    deliveryDate:
      getValue("deliveryDate"),

    itemType:
      getValue("itemType"),

    quantity:
      getValue("quantity"),

    measurements:
      getValue("measurements"),

    specialNotes:
      getValue("specialNotes"),

    stitchingStatus:
      getValue("stitchingStatus"),

    totalAmount:
      getValue("totalAmount"),

    advance:
      getValue("advance")

  };


  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify(customerData)

    });


    const result = await response.json();


    if (!result.success) {
      throw new Error(
        result.error || "Customer could not be saved"
      );
    }


    resultBox.innerHTML = `
      <div class="success">

        <strong>Customer saved successfully!</strong>

        <br><br>

        Reference Code:

        <strong>
          ${escapeHtml(result.referenceId)}
        </strong>

      </div>
    `;


    customerForm.reset();


    const quantityInput =
      document.getElementById("quantity");

    if (quantityInput) {
      quantityInput.value = "1";
    }


    await loadCustomers();


  } catch (error) {

    console.error("Save error:", error);

    resultBox.innerHTML = `
      <div class="error">

        <strong>Could not save customer.</strong>

        <br><br>

        ${escapeHtml(error.message)}

      </div>
    `;

  }


  saveButton.disabled = false;
  saveButton.textContent = "Save Customer";

});


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener("input", function() {

  const search =
    this.value.trim().toLowerCase();


  if (!search) {

    renderCustomers(allCustomers);

    return;
  }


  const filtered =
    allCustomers.filter(customer => {

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


  renderCustomers(filtered);

});


// ===============================
// REFRESH BUTTON
// ===============================

if (refreshBtn) {

  refreshBtn.addEventListener("click", function() {

    loadCustomers();

  });

}


// ===============================
// HELPERS
// ===============================

function getValue(id) {

  const element =
    document.getElementById(id);

  return element
    ? element.value.trim()
    : "";

}


function formatPhone(phone) {

  let number =
    String(phone || "")
      .replace(/\D/g, "");


  // Indian number without country code
  if (number.length === 10) {
    number = "91" + number;
  }


  return number;

}


function formatDate(value) {

  if (!value) {
    return "";
  }


  try {

    const date = new Date(value);


    if (isNaN(date.getTime())) {
      return String(value);
    }


    return date.toLocaleDateString("en-IN");

  } catch {

    return String(value);

  }

}


function escapeHtml(value) {

  return String(value ?? "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// ===============================
// START
// ===============================

loadCustomers();
