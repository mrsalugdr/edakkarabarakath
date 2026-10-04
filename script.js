const API_URL =
  "https://script.google.com/macros/s/AKfycbzHSlcGVg7EUUJdKf6PoPA0UhJCgbnd78lgy7bYRdGAzYplX7Pj8v8-fA2l4JFWxyGQ/exec";

const form = document.getElementById("customerForm");
const recordsContainer = document.getElementById("recordsContainer");
const customerCount = document.getElementById("customerCount");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");

let allCustomers = [];


/* =========================================
   LOAD CUSTOMERS
========================================= */

async function loadCustomers() {

  if (!recordsContainer) {
    console.error("recordsContainer not found");
    return;
  }

  recordsContainer.innerHTML = `
    <div class="loading">
      Loading customers...
    </div>
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
      throw new Error(
        data.error || "Unable to load customers"
      );
    }

    allCustomers = data.customers || [];

    renderCustomers(allCustomers);

  } catch (error) {

    console.error("Customer loading error:", error);

    if (customerCount) {
      customerCount.textContent = "0 customers";
    }

    recordsContainer.innerHTML = `
      <div class="error">
        Unable to load customer records.
        <br>
        <small>${escapeHTML(error.message)}</small>
      </div>
    `;
  }
}


/* =========================================
   RENDER CUSTOMER TABLE
========================================= */

function renderCustomers(customers) {

  if (!recordsContainer) return;

  if (customerCount) {
    customerCount.textContent =
      `${customers.length} customer${customers.length === 1 ? "" : "s"}`;
  }

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

    const phone = String(
      customer.phone || ""
    ).replace(/\D/g, "");

    let whatsappPhone = phone;

    if (phone.length === 10) {
      whatsappPhone = "91" + phone;
    }

    const message =
`Hello ${customer.customerName || ""},

Your stitching order is ready.

Reference Code: ${customer.referenceId || ""}

Thank you,
EDAkkara Barakath`;

    const whatsappURL =
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;


    rows += `
      <tr>

        <td>
          <strong>
            ${escapeHTML(customer.referenceId)}
          </strong>
        </td>

        <td>
          ${escapeHTML(customer.customerName)}
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

        <td>
          ${escapeHTML(customer.quantity)}
        </td>

        <td>
          ${formatDate(customer.receivedDate)}
        </td>

        <td>
          ${formatDate(customer.deliveryDate)}
        </td>

        <td>
          ₹${formatMoney(customer.totalAmount)}
        </td>

        <td>
          ₹${formatMoney(customer.balance)}
        </td>

        <td>
          <span class="status ${statusClass(customer.stitchingStatus)}">
            ${escapeHTML(
              customer.stitchingStatus || "Received"
            )}
          </span>
        </td>

        <td>
          <a
            class="whatsapp-btn"
            href="${whatsappURL}"
            target="_blank"
            rel="noopener noreferrer"
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


/* =========================================
   SAVE CUSTOMER
========================================= */

if (form) {

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      const saveButton =
        form.querySelector(
          'button[type="submit"]'
        );

      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
      }


      const getValue = id => {

        const element =
          document.getElementById(id);

        return element
          ? element.value.trim()
          : "";
      };


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
          getValue("stitchingStatus") ||
          "Received",

        totalAmount:
          getValue("totalAmount"),

        advance:
          getValue("advance")
      };


      try {

        const response = await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },

            body:
              JSON.stringify(customerData)
          }
        );


        const data =
          await response.json();


        if (!data.success) {

          throw new Error(
            data.error || "Save failed"
          );
        }


        const result =
          document.getElementById("result");


        if (result) {

          result.innerHTML = `
            <div style="
              padding:12px;
              margin-top:12px;
              background:#dcfce7;
              color:#166534;
              border-radius:8px;
              font-weight:600;
            ">
              Customer saved successfully.
              Reference:
              ${escapeHTML(data.referenceId)}
            </div>
          `;
        }


        form.reset();


        const quantity =
          document.getElementById("quantity");

        if (quantity) {
          quantity.value = "1";
        }


        const status =
          document.getElementById(
            "stitchingStatus"
          );

        if (status) {
          status.value = "Received";
        }


        await loadCustomers();

      } catch (error) {

        console.error(
          "Save customer error:",
          error
        );


        const result =
          document.getElementById("result");


        if (result) {

          result.innerHTML = `
            <div style="
              padding:12px;
              margin-top:12px;
              background:#fee2e2;
              color:#991b1b;
              border-radius:8px;
              font-weight:600;
            ">
              ${escapeHTML(error.message)}
            </div>
          `;
        }

      } finally {

        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent =
            "Save Customer";
        }
      }

    }
  );

}


/* =========================================
   SEARCH
========================================= */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    function () {

      const search =
        this.value
          .toLowerCase()
          .trim();


      if (!search) {

        renderCustomers(
          allCustomers
        );

        return;
      }


      const filtered =
        allCustomers.filter(
          customer => {

            return (

              String(
                customer.referenceId || ""
              )
                .toLowerCase()
                .includes(search)

              ||

              String(
                customer.customerName || ""
              )
                .toLowerCase()
                .includes(search)

              ||

              String(
                customer.phone || ""
              )
                .toLowerCase()
                .includes(search)

              ||

              String(
                customer.place || ""
              )
                .toLowerCase()
                .includes(search)

              ||

              String(
                customer.itemType || ""
              )
                .toLowerCase()
                .includes(search)

              ||

              String(
                customer.stitchingStatus || ""
              )
                .toLowerCase()
                .includes(search)
            );
          }
        );


      renderCustomers(filtered);

    }
  );

}


/* =========================================
   REFRESH BUTTON
========================================= */

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    loadCustomers
  );

}


/* =========================================
   HELPERS
========================================= */

function escapeHTML(value) {

  return String(value ?? "")

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}


function formatMoney(value) {

  const number =
    Number(value || 0);

  return number.toLocaleString(
    "en-IN"
  );
}


function formatDate(value) {

  if (!value) return "";

  const date =
    new Date(value);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return escapeHTML(value);
  }


  return date.toLocaleDateString(
    "en-GB"
  );
}


function statusClass(status) {

  return String(
    status || "Received"
  )
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    );
}


/* =========================================
   START WEBSITE
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadCustomers();

  }
);
