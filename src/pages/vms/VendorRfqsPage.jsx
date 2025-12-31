import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VendorRfqPage() {
  const { vendorCode } = useParams();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(vendorCode || "");
  const [rfqs, setRfqs] = useState([]);

  // table controls
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* ================= LOAD VENDORS ================= */
  useEffect(() => {
    // 🔹 Replace with API
    setVendors([
      { code: "V001", name: "ABC Technologies Pvt Ltd" },
      { code: "V002", name: "XYZ Solutions Limited" },
    ]);
  }, []);

  /* ================= LOAD RFQS BY VENDOR ================= */
  useEffect(() => {
    if (!selectedVendor) return;

    // 🔹 Replace with API (vendorCode)
    setRfqs([
      {
        reference_id: "RFQ-101",
        vendor_name: "ABC Technologies Pvt Ltd",
        email: "abc@test.com",
        mobile: "9876543210",
        entity: "IT",
        status_name: "Approved",
      },
      {
        reference_id: "RFQ-102",
        vendor_name: "ABC Technologies Pvt Ltd",
        email: "abc@test.com",
        mobile: "9876543210",
        entity: "Finance",
        status_name: "Suspended",
      },
    ]);

    setCurrentPage(1);
  }, [selectedVendor]);

  /* ================= SEARCH ================= */
  const filteredRfqs = rfqs.filter((r) =>
    `${r.reference_id} ${r.vendor_name} ${r.email} ${r.mobile} ${r.entity} ${r.status_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredRfqs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRfqs = filteredRfqs.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <Box m="20px">
      <Header title="Vendor RFQs" subtitle="Vendor wise RFQ details" />

      {/* ================= Vendor Dropdown ================= */}
      <FormControl fullWidth sx={{ maxWidth: 450, mb: 3 }}>
        <InputLabel sx={{ color: "#000" }}>
          Vendor Code - Vendor Name
        </InputLabel>
        <Select
          value={selectedVendor}
          label="Vendor Code - Vendor Name"
          onChange={(e) => {
            setSelectedVendor(e.target.value);
            navigate(`/vendor-rfqs/${e.target.value}`);
          }}
          sx={{
            color: "#000",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#000" },
          }}
        >
          {vendors.map((v) => (
            <MenuItem key={v.code} value={v.code}>
              {v.code} - {v.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ================= Search & Limit ================= */}
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search RFQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="form-select w-25"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* ================= RFQ TABLE ================= */}
      <div className="table-responsive bg-white rounded shadow-sm p-3">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th>Reference (RFQ) ID</th>
              <th>Vendor Name</th>
              <th>Vendor Email</th>
              <th>Vendor Mobile</th>
              <th>Entity</th>
              <th>Status</th>
               <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRfqs.length === 0 ? (
              <tr>
                <td colSpan="6">No RFQs found</td>
              </tr>
            ) : (
              paginatedRfqs.map((r) => (
                <tr key={r.reference_id}>
                  <td>{r.reference_id}</td>
                  <td>{r.vendor_name}</td>
                  <td>{r.email}</td>
                  <td>{r.mobile}</td>
                  <td>{r.entity}</td>
                  <td>{r.status_name}</td>
                  <td>
  <Tooltip title="View Details">
    <IconButton
      color="primary"
      size="small"
        onClick={() =>
                            navigate("/rfqs/" + data.reference_id)
                          }
                        >
    
      <VisibilityIcon />
    </IconButton>
  </Tooltip>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= Pagination ================= */}
      <div className="mt-3 text-end">
        <button
          className="btn btn-outline-secondary btn-sm me-1"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`btn btn-sm me-1 ${
              currentPage === i + 1
                ? "btn-primary"
                : "btn-outline-secondary"
            }`}
            onClick={() => goToPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </Box>
  );
}

export default VendorRfqPage;
