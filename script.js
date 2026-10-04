const API_URL =
  "https://script.google.com/macros/s/AKfycbzHSlcGVg7EUUJdKf6PoPA0UhJCgbnd78lgy7bYRdGAzYplX7Pj8v8-fA2l4JFWxyGQ/exec";

const recordsContainer = document.getElementById("recordsContainer");

let allCustomers = [];

// ===============================
// LOAD CUSTOMERS
// ===============================
async function loadCustomers() {
  recordsContainer.innerHTML = `
    <div class="loading">Loading customers...</div>
  `;

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

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unable to load customers");
    }

    allCustomers = data.customers || [];

    renderCustomers(allCustomers);

  } catch (error) {
    console.error(error);

    recordsContainer.innerHTML = `
      <div class="error">
        Unable to load customer records.
      </div>
    `;
  }
}


// ===============================
// RENDER HORIZONTAL TABLE
// ===============================
function renderCustomers(customers) {

  if (!customers.length) {
    recordsContainer.innerHTML = `
      <div class="empty">
        No customer records found.
      </div>
    `;
    return;
  }

  let rows = "";

  customers.forEach(customer => {

    const phone = String(customer.phone || "")
      .replace(/\D/g, "");

    const whatsappPhone =
      phone.length === 10
        ? "91" + phone
        : phone;

    const message =
      `Hello ${customer.customerName || ""},

Your stitching order is ready.

Reference Code: ${customer.referenceId}

Thank you,
EDAkkara Barakath`;

    const whatsappURL =
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

    rows += `
      <tr>

        <td class="ref">
          ${escapeHTML(customer.referenceId)}
        </td>

        <td>
          <strong>
            ${escapeHTML(customer.customerName)}
          </strong>
        </td>

        <td>
          ${escapeHTML(customer.phone)}
        </td>

        <td>
          ${escapeHTML(customer.place)}
        </td>

        <td>
          ${escapeHTML(customer.itemType)}
        </td>

        <td class="center">
          ${escapeHTML(customer.quantity)}
        </td>

        <td>
          ${formatDate(customer.receivedDate)}
        </td>

        <td>
          ${formatDate(customer.deliveryDate)}
        </td>

        <td class="amount">
          ₹${formatNumber(customer.totalAmount)}
        </td>

        <td class="amount">
          ₹${formatNumber(customer.balance)}
        </td>

        <td>
          <span class="status ${getStatusClass(customer.stitchingStatus)}">
            ${escapeHTML(customer.stitchingStatus || "Received")}
          </span>
        </td>

        <td>
          <a
            class="whatsapp-btn"
            href="${whatsappURL}"
            target="_blank"
            rel="noopener"
          >
            WhatsApp
          </a>
        </td>

      </tr>
    `;
  });


  recordsContainer.innerHTML = `
    <div class="records-table-wrapper">

      <table class="records-table">

        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Place</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Received</th>
            <th>Delivery</th>
            <th>Total</th>
            <th>Balance</th>
            <th>Status</th>
            <th>WhatsApp</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>

    </div>
  `;
}


// ===============================
// SEARCH
// ===============================
function searchCustomers(value) {

  const search = value.toLowerCase().trim();

  if (!search) {
    renderCustomers(allCustomers);
    return;
  }

  const filtered = allCustomers.filter(customer => {

    return (
      String(customer.referenceId || "")
        .toLowerCase()
        .includes(search) ||

      String(customer.customerName || "")
        .toLowerCase()
        .includes(search) ||

      String(customer.phone || "")
        .toLowerCase()
        .includes(search) ||

      String(customer.place || "")
        .toLowerCase()
        .includes(search)
    );
  });

  renderCustomers(filtered);
}


// ===============================
// HELPERS
// ===============================
function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatNumber(value) {

  const number = Number(value || 0);

  return number.toLocaleString("en-IN");
}


function formatDate(value) {

  if (!value) return "";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return escapeHTML(value);
  }

  return date.toLocaleDateString("en-GB");
}


function getStatusClass(status) {

  const value = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return value;
}


// ===============================
// SEARCH BOX
// ===============================
const searchInput =
  document.getElementById("searchInput");

if (searchInput) {

  searchInput.addEventListener("input", function () {
    searchCustomers(this.value);
  });

}


// ===============================
// START
// ===============================
loadCustomers();
