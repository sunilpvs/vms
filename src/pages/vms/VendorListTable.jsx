import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import EditIcon from "@mui/icons-material/Edit";

// MUI Components
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

function VendorListTable({
  Rfqs,
  currentPage,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  onSearch,
  searchTerm,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Re-initiate modal state
  const [openReinitiateModal, setOpenReinitiateModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Edit modal state
  const [openEditModal, setOpenEditModal] = useState(false);
  const [status, setStatus] = useState("");

  // Search filter
  const filteredRfqs = Rfqs.filter((rfq) =>
    `${rfq.reference_id} ${rfq.contact_person_name}
     ${rfq.contact_person_mobile} ${rfq.entity_name} ${rfq.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRfqs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRfqs = filteredRfqs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  /* ================= Re-initiate ================= */

  const handleReinitiateClick = (vendor) => {
    setSelectedVendor(vendor);
    setOpenReinitiateModal(true);
  };

  const handleReinitiateSubmit = () => {
    console.log("Re-initiated vendor:", selectedVendor);
    // API call here
    setOpenReinitiateModal(false);
  };

  /* ================= Edit ================= */

  const getStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Approved":
        return ["Blocked", "Suspended"];
      case "Blocked":
        return ["Approved", "Suspended"];
      case "Suspended":
        return ["Approved", "Blocked"];
      default:
        return [];
    }
  };

  const handleEditClick = (vendor) => {
    setSelectedVendor(vendor);
    setStatus(""); // force user to choose new status
    setOpenEditModal(true);
  };
  const handleEditSubmit = () => {
    console.log("Updated Status:", {
      reference_id: selectedVendor.reference_id,
      status,
    });
    // API call here
    setOpenEditModal(false);
  };

  return (
    <Box m="20px">
      <Header title="Vendors List" subtitle="Final Vendors List" />

      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        {/* Search & Limit */}
        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="form-control w-50"
          />

          <select
            className="form-select w-25"
            value={itemsPerPage}
            onChange={(e) => {
              onLimitChange(parseInt(e.target.value, 10));
              onPageChange(1);
            }}
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>RFQ ID</th>
                <th>Vendor Code</th>
                <th>Entity</th>
                <th>Contact Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRfqs.length === 0 ? (
                <tr>
                  <td colSpan="7">No records found</td>
                </tr>
              ) : (
                paginatedRfqs.map((data) => (
                  <tr key={data.id}>
                    <td>{data.reference_id}</td>
                    <td>{data.vendor_code || "N/A"}</td>
                    <td>{data.entity_name}</td>
                    <td>{data.contact_person_name}</td>
                    <td>{data.contact_person_mobile}</td>
                    <td>{data.status}</td>
                    <td>
                      {/* View */}
                      <Tooltip title="View">
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

                      {/* Re-initiate */}
                      <Tooltip title="Re-initiate">
                        <IconButton
                          color="warning"
                          size="small"
                          onClick={() => handleReinitiateClick(data)}
                        >
                          <ReplayIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Edit */}
                      <Tooltip title="Edit Status">
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={() => handleEditClick(data)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-3 text-end">
          <button
            className="btn btn-sm btn-outline-secondary me-1"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm me-1 ${currentPage === i + 1
                  ? "btn-primary"
                  : "btn-outline-secondary"
                }`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <Dialog
        open={openReinitiateModal}
        onClose={() => setOpenReinitiateModal(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: 2,
            padding: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "#000", fontWeight: 600 }}>
          Confirm Re-initiate
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#000", mb: 1, }}>
            Are you sure you want to re-initiate{" "}
            <strong>{selectedVendor?.entity_name}</strong>?
          </Typography>

          {/* Warning text */}
          <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
            Once submitted, this action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenReinitiateModal(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleReinitiateSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: 2,
            padding: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "#000", fontWeight: 600 }}>
          Edit Vendor Status
        </DialogTitle>

        <DialogContent sx={{ minWidth: 320 }}>
          <Typography sx={{ color: "#000", mb: 1 }}>
            Current Status:{" "}
            <strong>{selectedVendor?.status}</strong>
          </Typography>

          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: "#000" }}>
              Select New Status
            </InputLabel>

            <Select
              value={status}
              label="Select New Status"
              sx={{ color: "#000" }}
              onChange={(e) => setStatus(e.target.value)}
            >
              {getStatusOptions(selectedVendor?.status).map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!status}
            onClick={handleEditSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

VendorListTable.propTypes = {
  Rfqs: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default VendorListTable;
