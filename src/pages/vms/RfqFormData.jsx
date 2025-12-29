import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import styles from "./vms.module.css";
import { useNavigate } from "react-router-dom";
import { addCompanyInfo, updateCompanyInfo, getCompanyInfo, getCounterPartyInfo } from "../../services/vms/counterPartyService";
import { addMsmeDetails, getMsmeDetails, updateMsmeDetails } from "../../services/vms/msmeService";
import { addGstRegistrations, updateGstRegistrations, addGoodsAndServices, updateGoodsAndServices, addIncomeTaxDetails, updateIncomeTaxDetails, getGstRegistrations, getIncomeTaxDetails, getGoodsAndServices } from "../../services/vms/gstService";
import { addBankDetails, updateBankDetails, getBankDetails } from "../../services/vms/bankDetailsService";

import { addDocuments, getDocumentDetails, updateDocuments } from "../../services/vms/documentService";


import { approveRfq, sendBackRfqForCorrections, rejectRfq, verifyRfq, submitRfq } from "../../services/vms/rfqReviewService";

import { getVmsUserRole } from "../../services/auth/userDetails";

import { getAllRfqList } from "../../services/vms/vendorService";

import { getCountryCombo } from "../../services/admin/countryService";
import { addDeclarations, getDeclarations } from "../../services/vms/declarationService";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getStateCombo } from "../../services/admin/stateService";
import { addComments, getComments, getPreviousComments } from "../../services/vms/commentsService";



const RfqFormData = () => {
     const [referenceId, setReferenceId] = useState(null);
    const { reference_id } = useParams();
    const [status, setStatus] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [previousComments, setPreviousComments] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [selectedFY, setSelectedFY] = useState("");
    const [actionComment, setActionComment] = useState("");
       const [tanStatus, setTanStatus] = useState(""); // yes or no
          const [sameAsRegistered, setSameAsRegistered] = useState(false);
           const [countryCode, setCountryCode] = useState("");

    const [pendingRfqs, setPendingRfps] = useState([]);
    const [selectedReferenceId, setSelectedReferenceId] = useState("");
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const totalSteps = 6;

    const navigate = useNavigate();

    useEffect(() => {
        if (reference_id) {
            setSelectedReferenceId(reference_id);
        }
    }, [reference_id]);

    const handleRfqChange = (e) => {
        setSelectedReferenceId(e.target.value);
    }


    useEffect(() => {
        const fetchPendingRfqs = async () => {
            // if (!selectedReferenceId) return;
            try {
                const response = await getAllRfqList();
                const rfqs = response?.data || [];
                setPendingRfps(rfqs);
            } catch (error) {
                console.error("Failed to fetch pending RFQs:", error);
            }
        };
        fetchPendingRfqs();
    }, [selectedReferenceId]);


    const getCountries = async () => {
        try {
            const response = await getCountryCombo();
            const countriesResp = response?.data || [];  // Default to empty array if no data
            console.log(countriesResp);
            setCountries(countriesResp);
        } catch (error) {
            console.error("Failed to fetch countries:", error);
        }
    };

    useEffect(() => {
        getCountries();
    }, []);

    const getStates = async () => {
        try {
            const response = await getStateCombo();
            const statesResp = response?.data || [];  // Default to empty array if no data
            setStates(statesResp);
        } catch (error) {
            console.error("Failed to fetch countries:", error);
        }
    };

    useEffect(() => {
        getStates();
    }, []);


    const stepLabels = [
        "Business Entity Details",
        "MSME Details",
        "GST Information",
        "Bank Details",
        "Documents and Attachments",
        "Declaration and Acknowledgement",
    ];


    const [goods, setGoods] = useState([]);
    const [services, setServices] = useState([]);
    const [goodsAndServices, setGoodsAndServices] = useState([]);

    // ======== GOODS ========
    const gsForm_addGoods = () => {
        if (goods.length < 5) setGoods([...goods, ""]);
    };

    const gsForm_changeGoods = (index, value) => {
        const updated = [...goods];
        updated[index] = value;
        setGoods(updated);
    };

    const gsForm_deleteGoods = (index) => {
        const updated = [...goods];
        updated.splice(index, 1);
        setGoods(updated);
    };

    // ======== SERVICES ========
    const gsForm_addService = () => {
        if (services.length < 5) setServices([...services, ""]);
    };

    const gsForm_changeService = (index, value) => {
        const updated = [...services];
        updated[index] = value;
        setServices(updated);
    };

    const gsForm_deleteService = (index) => {
        const updated = [...services];
        updated.splice(index, 1);
        setServices(updated);
    };

    // ======== GOODS & SERVICES ========
    const gsForm_addGoodsServicesRow = () => {
        if (goodsAndServices.length < 5)
            setGoodsAndServices([...goodsAndServices, { goods: "", services: "" }]);
    };

    const gsForm_changeGoodsServices = (index, field, value) => {
        const updated = [...goodsAndServices];
        updated[index][field] = value;
        setGoodsAndServices(updated);
    };

    const gsForm_deleteGoodsServices = (index) => {
        const updated = [...goodsAndServices];
        updated.splice(index, 1);
        setGoodsAndServices(updated);
    };


    const [selectedYear, setSelectedYear] = useState('');
    const [yearlyData, setYearlyData] = useState([]);

    // ✅ Dynamically generate N years from a start year
    const generateYearRanges = (startYear, count) => {
        const years = [];
        for (let i = 0; i < count; i++) {
            const from = startYear + i;
            const to = from + 1;
            years.push(`${from}-${to}`);
        }
        return years;
    };

    const availableYears = generateYearRanges(2021, 100); // Generate 10 years

    // ✅ Add a year block
    const handleAddYear = () => {
        if (
            selectedYear &&
            yearlyData.length < 3 &&
            !yearlyData.find(entry => entry.year === selectedYear)
        ) {
            setYearlyData(prev => [
                ...prev,
                {
                    year: selectedYear,
                    total_sales_volume: "",             // total_sales_volume
                    total_sales_amount: "",             // total_sales_amount
                    export_sales_volume: "",      // export_sales_volume
                    export_sales_amount: "",      // export_sales_amount
                    file: null
                }

            ]);
            setSelectedYear('');
        }
    };

    // ✅ Input value change
    const handleChange = (index, field, value) => {
        setYearlyData(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };



    // ✅ File change
    const handleFileChange = (index, file) => {
        setYearlyData(prev => {
            const updated = [...prev];
            updated[index].file = file;
            return updated;
        });
    };

    const handleDocumentChange = (docType, file) => {
        setDocuments(prev => ({
            ...prev,
            [docType]: {
                file,
                url: URL.createObjectURL(file),
            },
        }));
    };





    const handleDeclarationChange = (e) => {
        const { name, type, files, value } = e.target;

        if (type === "file") {
            const file = files[0];
            if (!file) return; // user canceled file picker

            setDeclarationInfo((prev) => ({
                ...prev,
                [name]: {
                    file,
                    url: URL.createObjectURL(file), // ✅ create local preview
                },
            }));
        } else {
            setDeclarationInfo((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };


    // ✅ Delete year section
    const handleDelete = (index) => {
        const updated = [...yearlyData];
        updated.splice(index, 1);
        setYearlyData(updated);
    };

    const currentYear = new Date().getFullYear();



    const generateFinancialYears = () => {
        const years = [];
        for (let y = currentYear - 3; y < currentYear; y++) {
            years.push(`${y}-${y + 1}`);
        }
        return years;
    };

    const financialYears = generateFinancialYears();
    const [formData, setFormData] = useState({
        fy1: "",
        fy2: "",
        fy3: "",
        turnover1: "",
        turnover2: "",
        turnover3: "",
        itrStatus1: "",
        itrStatus2: "",
        itrStatus3: "",
        ackNo1: "",
        ackNo2: "",
        ackNo3: "",
        filedDate1: "",
        filedDate2: "",
        filedDate3: "",
    });



    // ✅ Handle all input fields (including turnover validation)
    const handleIncomeChange = (e) => {
        const { name, value } = e.target;

        // Allow only 0 or positive numbers for turnover fields
        if (name.startsWith("turnover")) {
            if (value === "" || /^[0-9]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ✅ Get dynamic financial year options
    const getFilteredYears = (field) => {
        if (field === "fy1") {
            return financialYears;
        }
        if (field === "fy2") {
            return financialYears.filter((fy) => fy !== formData.fy1);
        }
        if (field === "fy3") {
            return financialYears.filter(
                (fy) => fy !== formData.fy1 && fy !== formData.fy2
            );
        }
        return [];
    };






    const [businessType, setBusinessType] = useState('');
    const [otherBusinessType, setOtherBusinessType] = useState('');
    const handleBusinessTypeChange = (e) => {
        setBusinessType(e.target.value);
        if (e.target.value !== 'Other') {
            setOtherBusinessType('');
        }
    };



    // Comments


    // Vendor dropdown

    const nextPage = () => {
        if (currentPage < totalSteps - 1) setCurrentPage(currentPage + 1);
    };
    const prevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };



    // Group 1: Company types that require CIN, TAN, etc.
    const companyTypesRequiringFullDetails = [
        'Private Limited Companies',
        'Public Limited Companies',
        'One-Person Companies',
        'Joint-Venture Company',
    ];

    // Group 2: Simpler entities needing only registration number as per certificate
    const entitiesRequiringBasicRegistration = [
        'Sole Proprietorship',
        'Partnership',
        'Limited Liability Partnership',
        'Non-Government Organization (NGO)',
    ];



    
        // Step 1: Company Info | Counterparty information 
        const [companyInfo, setCompanyInfo] = useState({
            full_registered_name: "",
            business_entity_type: "",
            reg_number: "",
            tan_number: "",
            trading_name: "",
            company_email: "",
            country_type: "",
            country_id: null,
            state_id: null,
            country_text: "",
            state_text: "",
            telephone: "",
            registered_address: "",
            business_address: "",
            contact_person_title: "",
            contact_person_name: "",
            contact_person_email: "",
            contact_person_mobile: "",
            accounts_person_title: "",
            accounts_person_name: "",
            accounts_person_contact_no: "",
            accounts_person_email: "",
    
            isOtherCountry: false,
        });
        const isIndia = countries.find(c => c.id == companyInfo.country_id)?.country?.toLowerCase() === "india";
    
        const selectedEntityType = companyInfo.business_entity_type;
        const showFullCompanyFields = companyTypesRequiringFullDetails.includes(selectedEntityType);
        const showBasicRegistrationField = entitiesRequiringBasicRegistration.includes(selectedEntityType);
    
    
    
        //  Auto-set India for Sole Proprietorship & Partnership (non-editable)
        useEffect(() => {
            const isAutoIndiaType = ["Sole Proprietorship", "Partnership"].includes(
                companyInfo.business_entity_type
            );
    
            if (isAutoIndiaType) {
                const india = countries.find(
                    (c) => c.country?.toLowerCase() === "india"
                );
                if (india) {
                    setCompanyInfo((prev) => ({
                        ...prev,
                        country_of_incorporation: india.id,
                        isOtherCountry: false,
                        state: "",
                    }));
                }
            }
        }, [companyInfo.business_entity_type, countries]);
    
    
    
        useEffect(() => {
            const fetchCompanyInfo = async () => {
                try {
                    const response = await getCompanyInfo(selectedReferenceId);
                    const data = response?.data;
                    if (!data) return;
    
                    const normalized = {
                        full_registered_name: data.full_registered_name || "",
                        business_entity_type: data.business_entity_type || "",
                        reg_number: data.reg_number || "",
                        tan_number: data.tan_number || "",
                        trading_name: data.trading_name || "",
                        company_email: data.company_email || "",
    
                        isOtherCountry: data.country_type === "Others",
    
                        country_type: data.country_type || "",
    
                        country_id: data.country_type === "India" ? data.country_id : null,
                        state_id: data.country_type === "India" ? data.state_id : null,
    
                        country_text: data.country_type === "Others" ? data.country_text : "",
                        state_text: data.country_type === "Others" ? data.state_text : "",
                        telephone: data.telephone || "",
                        registered_address: data.registered_address || "",
                        business_address: data.business_address || "",
                        contact_person_title: data.contact_person_title || "",
                        contact_person_name: data.contact_person_name || "",
                        contact_person_email: data.contact_person_email || "",
                        contact_person_mobile: data.contact_person_mobile || "",
                        accounts_person_title: data.accounts_person_title || "",
                        accounts_person_name: data.accounts_person_name || "",
                        accounts_person_contact_no: data.accounts_person_contact_no || "",
                        accounts_person_email: data.accounts_person_email || "",
    
                    };
    
    
    
                    setCompanyInfo((prev) => ({ ...prev, ...normalized }));
                } catch (error) {
                    console.error("Error fetching company info:", error);
                }
            };
    
            if (selectedReferenceId) fetchCompanyInfo();
        }, [selectedReferenceId]);
    
    
        // submit company info add if its new else update
        const handleSubmitCompanyInfo = async (e) => {
    
    
            let errors = [];
    
            //REQUIRED FIELDS FOR STEP-1 ONLY (Except Country of Incorporation)
    
            if (!companyInfo.full_registered_name)
                errors.push("Registered Name (as per PAN) is required");
    
            if (!companyInfo.trading_name)
                errors.push("Trading Name is required");
    
            if (!tanStatus)
                errors.push("TAN availability selection is required");
    
            if (tanStatus === "yes" && !companyInfo.tan_number)
                errors.push("TAN Number is required");
    
            if (!companyInfo.telephone)
                errors.push("Telephone Number is required");
    
            if (!companyInfo.registered_address)
                errors.push("Registered Address is required");
    
            if (!companyInfo.business_address)
                errors.push("Business Address is required");
    
    
    
            if (!companyInfo.contact_person_name)
                errors.push("Contact Person Name is required");
    
            if (!companyInfo.contact_person_mobile)
                errors.push("Contact Person Mobile Number is required");
    
            if (!companyInfo.contact_person_email)
                errors.push("Contact Person Email is required");
    
            if (!companyInfo.accounts_person_name)
                errors.push("Accounts Person Name is required");
    
            if (!companyInfo.accounts_person_contact_no)
                errors.push("Accounts Person Contact Number is required");
    
            if (!companyInfo.accounts_person_email)
                errors.push("Accounts Person Email is required");
    
    
            if (errors.length > 0) {
                alert("Please fill all required fields:\n\n" + errors.join("\n"));
                return;
            }
    
            // ✅ If all good → move to next page
            nextPage();
    
    
    
            // try {
            //     const tanFormData = new FormData();
            //     tanFormData.append("reference_id", referenceId);
            //     tanFormData.append("tan_number", hasTan === "Yes" ? companyInfo.tan_number : "");
            //     // if (hasTan === "No" && tanExemptionFile) {
            //     //     tanFormData.append("tan_exemption_certificate", tanExemptionFile);
            //     // }
    
            //     await addCompanyInfo(referenceId, tanFormData);
    
            //     toast.success("Company information added successfully!");
            //     nextPage();
            // } catch (error) {
            //     console.error("Error adding company info:", error);
            //     toast.error("Error occurred while saving company information.");
            // }
    
    
            // add if new else update
            try {
                const existingResponse = await getCompanyInfo(referenceId);
                if (existingResponse && existingResponse.status === 200 && existingResponse.data && Object.keys(existingResponse.data).length > 0) {
                    // Update existing
                    await updateCompanyInfo(referenceId, companyInfo);
                    toast.success("Company information updated successfully!");
                    nextPage();
                }
    
            } catch (error) {
                // Add new
                try {
                    await addCompanyInfo(referenceId, companyInfo);
                    toast.success("Company information added successfully!");
                    nextPage();
                } catch (err) {
                    console.error("Error adding company info:", err);
                    toast.error("Error occurred while saving company information.");
                }
            }
    
        };
    
    
        const [entityFields, setEntityFields] = useState({
            showFullFields: false,
            showBasicFields: false,
        });
    
    
    
    
        useEffect(() => {
            const selectedEntityType = companyInfo.business_entity_type;
    
            const showFullCompanyFields = companyTypesRequiringFullDetails.includes(selectedEntityType);
            const showBasicRegistrationField = entitiesRequiringBasicRegistration.includes(selectedEntityType);
    
            setEntityFields({
                showFullFields: showFullCompanyFields,
                showBasicFields: showBasicRegistrationField,
            });
    
            // Reset / Nullify fields bas   ed on business entity type
            setCompanyInfo((prev) => {
                let updatedInfo = { ...prev };
    
                // Case 1: Section 8 Company → registration number should be null
                if (selectedEntityType === 'Section 8 Company') {
                    updatedInfo.registration_number = null;
    
                    updatedInfo.tan_number = null;
                }
    
    
                // Case 2: Entities that don't require CIN/TAN → set them to null
                if (entitiesRequiringBasicRegistration.includes(selectedEntityType)) {
                    updatedInfo.cin_number = null;
                    updatedInfo.tan_number = null;
                }
    
                return updatedInfo;
            });
        }, [companyInfo.business_entity_type]);
    
    
        useEffect(() => {
            if (companyInfo.tan_number && companyInfo.tan_number !== "") {
                setTanStatus("yes");
            } else {
                setTanStatus("no");
            }
        }, [companyInfo.tan_number]);
    
    
        // auto select the checkbox if registered address and business address are same
        useEffect(() => {
            if (companyInfo.registered_address === companyInfo.business_address && companyInfo.registered_address !== "") {
                setSameAsRegistered(true);
            } else {
                setSameAsRegistered(false);
            }
        }, [companyInfo.registered_address, companyInfo.business_address]);
    
    
        const handleCompanyInfoChange = (e) => {
            const { name, value } = e.target;
            let cleaned = value;
    
    
            // 🟢 Name fields — only letters and spaces, uppercase
            const nameFields = [
                "full_registered_name",
                "trading_name",
                "contact_person_name",
                "accounts_person_name",
            ];
            if (nameFields.includes(name)) {
                cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
            }
    
    
            //  Registration / TAN / PAN / GST / UDYAM / NGO fields
            else if (
                [
                    "reg_number",
                    "firm_reg_number",
                    "llp_reg_number",
                    "plc_reg_number",
                    "pulc_reg_number",
                    "opc_reg_number",
                    "sc_reg_number",
                    "jvc_reg_number",
                    "ngo_reg_number",
                    "tan_number",
                    "pan_number",
                    "gst_vat_number",
                    "udyam_registration_number",
                    "registration_number",
                ].includes(name)
            ) {
                cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            }
    
            // 🟢 Addresses — keep as typed
            else if (["registered_address", "business_address", "bank_address"].includes(name)) {
                cleaned = value;
            }
    
            // 🟢 Emails — lowercase
            else if (name.includes("email")) {
                cleaned = value.toLowerCase();
            }
    
            // 🟢 Phone numbers — digits and +, -
            else if (["telephone", "contact_person_mobile", "accounts_person_contact_no"].includes(name)) {
                cleaned = value.replace(/[^0-9+\-]/g, "");
            }
    
            // 🟢 Dropdowns — keep as selected
            else if (
                [
                    "business_entity_type",
                    "country_of_incorporation",
                    "state",
                    "contact_person_title",
                    "accounts_person_title",
                ].includes(name)
            ) {
                cleaned = value;
            }
    
            // 🟢 Default — uppercase text
            else {
                cleaned = value.toUpperCase();
            }
    
            // ✅ Save cleaned value (not raw value)
            setCompanyInfo((prev) => ({
                ...prev,
                [name]: cleaned,
            }));
    
            // 🗺️ Country logic
            if (name === "country_of_incorporation") {
                const selectedCountry = countries.find((c) => c.id == value);
                if (selectedCountry) {
                    setCountryCode(selectedCountry.code || "");
                }
    
                if (selectedCountry?.country?.toLowerCase() !== "india") {
                    setCompanyInfo((prev) => ({
                        ...prev,
                        isOtherCountry: true,
                    }));
                } else {
                    setCompanyInfo((prev) => ({
                        ...prev,
                        isOtherCountry: false,
                    }));
                }
            }
        };
    
         // STEP 2: MSME details
        const [msmeInfo, setMsmeInfo] = useState({
            registered_under_msme: "",
            udyam_registration_number: "",
            category: "",
        });
    
        useEffect(() => {
            const fetchMsme = async () => {
                try {
                    const response = await getMsmeDetails(selectedReferenceId); // 👈 pass correct vendor_id
                    if (response?.data?.msme) {
                        setMsmeInfo((prev) => ({
                            ...prev,
                            registered_under_msme: response?.data?.msme?.registered_under_msme === 1 ? "true" : "false",
                            udyam_registration_number: response?.data?.msme?.udyam_registration_number || "",
                            category: response?.data?.msme?.category || "",
                        }));
                    }
    
                } catch (err) {
                    console.error("Failed to fetch MSME info:", err);
                }
            };
    
            fetchMsme();
        }, [selectedReferenceId]);
    
    
        const handleMsmeChange = (e) => {
            const { name, value } = e.target;
            let cleaned = value;
    
            //Udyam Registration Number → uppercase alphanumeric only
            if (name === "udyam_registration_number") {
                cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
            }
    
            // 🏷 Category (Micro / Small / Medium) or Dropdown → keep value as-is
            else if (["category", "registered_under_msme"].includes(name)) {
                cleaned = value;
            }
    
            // Default → uppercase
            else {
                cleaned = value.toUpperCase();
            }
    
            setMsmeInfo((prev) => ({
                ...prev,
                [name]: cleaned,
            }));
        };
    
    
        // add if new else update msme details
        const handleSaveMsmeInfo = async () => {
    
    
            let errors = [];
    
            // 1️⃣ MSME Registered selection required
            if (!msmeInfo.registered_under_msme) {
                errors.push("Please select whether MSME Registration is available.");
            }
    
            // 2️⃣ If MSME = Yes → validate Category + Udyam Number
            if (msmeInfo.registered_under_msme === "true") {
                if (!msmeInfo.udyam_number_registration || msmeInfo.udyam_number_registration.trim() === "") {
                    errors.push("Udyam Registration Number is required.");
                }
    
            }
    
            if (!msmeInfo.category || msmeInfo.category.trim() === "") {
                errors.push("MSME Category is required.");
            }
    
    
    
            // If MSME = No → do NOT validate category or udyam
            // (No extra validation here)
    
            // If errors exist → block next page
            if (errors.length > 0) {
                alert("Please fill required MSME details:\n\n" + errors.join("\n"));
                return;
            }
    
            // ✅ Everything OK → go to next step
            nextPage();
    
    
    
            try {
    
                const msmePayload = {
                    type: "msme",
                    registered_under_msme: msmeInfo.registered_under_msme === "true",
                    udyam_registration_number: msmeInfo.udyam_registration_number,
                    category: msmeInfo.category,
                };
    
                const existingResponse = await getMsmeDetails(referenceId);
                if (existingResponse && existingResponse.status === 200 && existingResponse.data && Object.keys(existingResponse.data).length > 0) {
                    // Update existing
                    await updateMsmeDetails(referenceId, msmePayload);
                    toast.success("MSME information updated successfully!");
                    nextPage();
                }
            } catch (error) {
                // Add new
                try {
    
                    const msmePayload = {
                        type: "msme",
                        registered_under_msme: msmeInfo.registered_under_msme === "true",
                        udyam_registration_number: msmeInfo.udyam_registration_number,
                        category: msmeInfo.category,
                    };
    
                    await addMsmeDetails(referenceId, msmePayload);
                    toast.success("MSME information added successfully!");
                    nextPage();
                } catch (err) {
                    console.error("Error adding MSME info:", err);
                    toast.error("Error occurred while saving MSME information.");
                }
            }
        };
    

    // STEP 3: Goods/Services and GST Information



    // const handleIncomeChange = (e) => {
    //     const { name, value } = e.target;
    //     setIncomeTaxDetails((prev) => ({ ...prev, [name]: value }));
    // };


    const [count, setCount] = useState(0);
    const [gstformData, setgstFormData] = useState([]);

    const handleCountChange = (e) => {
        const newCount = parseInt(e.target.value, 10);
        setCount(newCount);

        const updatedData = Array.from({ length: newCount }, (_, index) => {
            return formData[index] || { state: "", gstNumber: "", regDate: "" };
        });

        setgstFormData(updatedData);
    };

    const [goodsServices, setGoodsServices] = useState({
        type_of_counterparty: "",
        others: "",
        items: [],
        type: "",
        description: "",
    });

    const [gstMeta, setGstMeta] = useState({
        reg_type: "",
        periodicity_gstr1: "",
    });


    const [incomeTaxDetails, setIncomeTaxDetails] = useState({
        fin_year: "",
        turnover: "",
        status_of_itr: "",
        itr_ack_num: "",
        itr_filed_date: "",
    });

    // get goods and services
    useEffect(() => {
        const fetchGoodsAndServices = async () => {
            try {
                const response = await getGoodsAndServices(selectedReferenceId);
                const data = response?.data;

                if (data && data.length > 0) {
                    // Extract top-level info (shared for all)
                    const type_of_counterparty = data[0].type_of_counterparty || "";
                    const others = data[0].others || "";

                    // Separate by type
                    const goodsList = data
                        .filter(item => item.type === "Goods")
                        .map(item => item.description || "");

                    const servicesList = data
                        .filter(item => item.type === "Services")
                        .map(item => item.description || "");

                    const goodsAndServicesList = data
                        .filter(item => item.type === "Goods and Services")
                        .map(item => {
                            const [goodsPart, servicesPart] = (item.description || "").split("&").map(str => str.trim());
                            return { goods: goodsPart || "", services: servicesPart || "" };
                        });

                    setGoods(goodsList);
                    setServices(servicesList);
                    setGoodsAndServices(goodsAndServicesList);

                    setGoodsServices({
                        type_of_counterparty,
                        others,
                        items: data.map(item => ({
                            type: item.type || "",
                            description: item.description || ""
                        }))
                    });
                }
            } catch (error) {
                console.error("Error fetching Goods and Services:", error);
            }
        };

        if (selectedReferenceId) fetchGoodsAndServices();
    }, [selectedReferenceId]);

    // get gst registrations
    useEffect(() => {
        const fetchGstRegistrations = async () => {
            try {
                const response = await getGstRegistrations(selectedReferenceId);
                const data = response?.data;
                if (data && data.length > 0) {
                    setgstFormData(data.map(item => ({
                        state: item.state || "",
                        gstNumber: item.gst_number || "",
                        regDate: item.reg_date || "",
                    })));
                    setGstMeta({
                        reg_type: data[0].reg_type || "",
                        periodicity_gstr1: data[0].periodicity_gstr1 || "",
                    });
                    setCount(data.length);
                }
            } catch (error) {
                console.error("Error fetching GST Registrations:", error);
            }
        };

        if (selectedReferenceId) fetchGstRegistrations();
    }, [selectedReferenceId]);


    // get income tax details


    useEffect(() => {
        const fetchIncomeTaxDetails = async () => {
            try {
                const response = await getIncomeTaxDetails(selectedReferenceId);
                const data = response?.data;

                if (data && data.length > 0) {
                    // Sort by year if needed, or assume API gives correct order
                    const details = data.slice(0, 3); // limit to 3 FYs

                    setFormData({
                        fy1: details[0]?.fin_year || "",
                        fy2: details[1]?.fin_year || "",
                        fy3: details[2]?.fin_year || "",

                        turnover1: details[0]?.turnover || "",
                        turnover2: details[1]?.turnover || "",
                        turnover3: details[2]?.turnover || "",

                        itrStatus1: details[0]?.status_of_itr || "",
                        itrStatus2: details[1]?.status_of_itr || "",
                        itrStatus3: details[2]?.status_of_itr || "",

                        ackNo1: details[0]?.itr_ack_num || "",
                        ackNo2: details[1]?.itr_ack_num || "",
                        ackNo3: details[2]?.itr_ack_num || "",

                        filedDate1: details[0]?.itr_filed_date || "",
                        filedDate2: details[1]?.itr_filed_date || "",
                        filedDate3: details[2]?.itr_filed_date || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching Income Tax Details:", error);
            }
        };

        if (selectedReferenceId) fetchIncomeTaxDetails();
    }, [selectedReferenceId]);




    // save goods and services
    const handleSaveGoodsServices = async () => {
        try {
            // Combine all goods/services entries
            const items = [
                ...goods.map(g => ({ type: "Goods", description: g })),
                ...services.map(s => ({ type: "Services", description: s })),
                ...goodsAndServices.map(gs => ({
                    type: "Goods and Services",
                    description: `${gs.goods}${gs.goods && gs.services ? " & " : ""}${gs.services}` || ""
                }))
            ];

            let payload = {
                type_of_counterparty: goodsServices.type_of_counterparty || "",
                others: goodsServices.others || null,
                items
            };

            // Validate
            const hasValidItems = items.some(i => i.type && i.description);
            if (!payload.type_of_counterparty || !hasValidItems) {
                toast.error("Type of counterparty and at least one valid goods/service are required.");
                return false;
            }

            await addGoodsAndServices(selectedReferenceId, payload);
            toast.success("Goods & Services saved successfully!");
            return true;

        } catch (error) {
            console.error("Error saving Goods/Services:", error);
            toast.error("Failed to save Goods & Services.");
            return false;
        }
    };

    // save gst registrations
    const handleSaveGstRegistrations = async () => {
        try {
            const payload = {
                items: gstformData.map(entry => ({
                    state: entry.state || "",
                    gst_number: entry.gstNumber || "",
                    reg_date: entry.regDate || "",
                })),
                reg_type: gstMeta.reg_type,
                periodicity_gstr1: gstMeta.periodicity_gstr1,
            };

            await addGstRegistrations(selectedReferenceId, payload);

            toast.success("GST Registrations saved successfully!");
            return true;
        } catch (error) {
            console.error("Error saving GST Registrations:", error);
            toast.error("Failed to save GST Registrations.");
            return false;
        }
    };

    // save income tax details
    const handleSaveIncomeTaxDetails = async () => {
        try {
            // Prepare payload for all 3 years
            const payload = [1, 2, 3]
                .map(i => ({
                    fin_year: formData[`fy${i}`] || "",
                    turnover: formData[`turnover${i}`] || "",
                    status_of_itr: formData[`itrStatus${i}`] || "",
                    itr_ack_num: formData[`ackNo${i}`] || "",
                    itr_filed_date: formData[`filedDate${i}`] || "",
                }))
                .filter(entry => entry.fin_year); // only include filled rows

            if (payload.length === 0) {
                toast.error("Please fill at least one year's data before saving.");
                return false;
            }

            await addIncomeTaxDetails(selectedReferenceId, { items: payload });

            toast.success("Income Tax Details saved successfully!");
            return true;
        } catch (error) {
            console.error("Error saving Income Tax Details:", error);
            toast.error("Failed to save Income Tax Details.");
            return false;
        }
    };



    const handleGstFieldChange = (index, field, value) => {
        setgstFormData((prevData) => {
            const updated = [...prevData];
            updated[index][field] = value;
            return updated;
        });
    };

    // handle goods and services input changes
    const handleGoodsServicesChange = (e, section) => {
        const { name, value } = e.target;
        if (section === 'goodsServices') {
            setGoodsServices(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveGstForm = async () => {
        const goodsServicesSaved = await handleSaveGoodsServices();
        if (!goodsServicesSaved) return;
        const gstRegistrationsSaved = await handleSaveGstRegistrations();
        if (!gstRegistrationsSaved) return;
        const incomeTaxDetailsSaved = await handleSaveIncomeTaxDetails();
        if (!incomeTaxDetailsSaved) return;
        toast.success("Gst Details saved successfully!");
        nextPage();
    };

    // STEP 4: Banking Information
    const [bankInfo, setBankInfo] = useState({
        account_holder_name: "",
        bank_name: "",
        bank_address: "",
        country: "",
        account_number: "",
        ifsc_code: "",
        swift_code: "",
        beneficiary_name: "",
        involves_third_party: null,
        subcontractor_in_sanctioned_country: null,
    });

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const response = await getBankDetails(selectedReferenceId);

                if (response?.data?.bank && response?.data?.compliance) {
                    const compliance = response.data.compliance;

                    setBankInfo((prev) => ({
                        ...prev,
                        ...response.data.bank,
                        involves_third_party:
                            compliance.involves_third_party === 1 ||
                                compliance.involves_third_party === true
                                ? "true"
                                : "false",
                        subcontractor_in_sanctioned_country:
                            compliance.subcontractor_in_sanctioned_country === 1 ||
                                compliance.subcontractor_in_sanctioned_country === true
                                ? "true"
                                : "false",
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch bank and compliance details:", err);
            }
        };

        fetchBankDetails();
    }, [selectedReferenceId]);

    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;
        setBankInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSaveBankDetails = async () => {
        try {
            const bankPayload = {
                type: "bank",
                account_holder_name: bankInfo.account_holder_name,
                bank_name: bankInfo.bank_name,
                bank_address: bankInfo.bank_address,
                country: bankInfo.country,
                account_number: bankInfo.account_number,
                ifsc_code: bankInfo.ifsc_code,
                swift_code: bankInfo.swift_code,
                beneficiary_name: bankInfo.beneficiary_name,
            };

            const compliancePayload = {
                type: "compliance",
                involves_third_party: bankInfo.involves_third_party === "true",
                subcontractor_in_sanctioned_country:
                    bankInfo.subcontractor_in_sanctioned_country === "true",
            };

            console.log("Bank Payload:", bankPayload);
            console.log("Compliance Payload:", compliancePayload);

            await addBankDetails(selectedReferenceId, bankPayload);
            //await addComplianceDetails(selectedReferenceId, compliancePayload);
            alert("Step 4 saved successfully!");
            nextPage();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to save Step 4");
        }
    };



    // Step 5: Documents
    const [documents, setDocuments] = useState({
        pan: null,
        gstin: null,
        msme: null,
        cheque: null,
        tan: null,
        incorporation: null,
        tds: null,
    });

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await getDocumentDetails(selectedReferenceId);
                if (response?.data) {
                    const docs = {};
                    response.data.forEach(doc => {
                        docs[doc?.doc_type] = {
                            id: doc?.doc_id,     // 👈 keep the id
                            file: null,          // user hasn't selected new file yet
                            url: doc?.file_path  // stored file path
                        };
                    });
                    setDocuments(prev => ({
                        ...prev,
                        ...docs
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };
        fetchDocuments();
    }, [selectedReferenceId]);


    const handleSaveDocuments = async () => {
        try {
            const newFilesFormData = new FormData();

            const newFiles = Object.entries(documents).filter(([docType, value]) => value?.file);

            if (newFiles.length === 0) {
                alert("No new files to upload. Please continue.");
                nextPage();
                return;
            }

            for (const [docType, value] of newFiles) {
                newFilesFormData.append("files[]", value.file);
                newFilesFormData.append("doc_types[]", docType);
            }

            const response = await addDocuments(selectedReferenceId, newFilesFormData); // same endpoint

            if (response?.data?.message?.includes("success")) {
                alert("Documents saved successfully!");

                // 🔄 re-fetch updated documents
                const refreshed = await getDocumentDetails(8);
                if (refreshed?.data) {
                    const documents = {};
                    refreshed.data.forEach(doc => {
                        documents[doc?.doc_type] = {
                            file: null,
                            url: doc?.file_path
                        };
                    });
                    setDocuments(documents);
                }

                nextPage();
            } else {
                throw new Error(response?.data?.error || "Unknown error");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to upload documents. Please try again.");
        }
    };


    // Step 6: Declarations

    const [declarationInfo, setDeclarationInfo] = useState({
        name: '',
        organization: '',
        designation: '',
        confidentiality_name: '',
        confidentiality_org: '',
        confidentiality_designation: '',
        title: '',
        date: '',
        place: '',
        signedFile: null,
    });


    useEffect(() => {
        if (!selectedReferenceId) return;
        const fetchDeclarations = async () => {
            try {
                const response = await getDeclarations(selectedReferenceId);
                console.log("Fetched declarations:", response);

                if (response?.data) {
                    const declaration = response?.data;
                    console.log("declaration:", declaration);

                    const mainMatch = declaration?.declaration_text?.match(
                        /I\/We\s+(.*?)\s+of\s+(.*?)\s+designated\s+as\s+(.*?)\s/i
                    );

                    const confMatch = declaration.confidentiality_ack?.match(
                        /I\/We\s+(.*?)\s+of\s+(.*?)\s+designated/i
                    );

                    setDeclarationInfo({
                        name: mainMatch?.[1]?.trim() || '',
                        organization: mainMatch?.[2]?.trim() || '',
                        designation: mainMatch?.[3]?.trim() || '',
                        confidentiality_name: confMatch?.[1]?.trim() || '',
                        confidentiality_org: confMatch?.[2]?.trim() || '',
                        confidentiality_designation: declaration.designation || '',
                        title: declaration.designation || '',
                        date: declaration.signed_date || '',
                        place: declaration.place || '',
                        signedFile: declaration.authorized_signatory || null,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };

        fetchDeclarations();
    }, [selectedReferenceId]);




    const handleSaveDeclaration = async () => {
        try {
            const formData = new FormData();

            formData.append(
                'declaration_text',
                `I/We ${declarationInfo.name} of ${declarationInfo.organization} designated as ${declarationInfo.designation} declare the information provided...`
            );

            formData.append(
                'confidentiality_ack',
                `I/We ${declarationInfo.confidentiality_name} of ${declarationInfo.confidentiality_org} designated as ${declarationInfo.confidentiality_designation} acknowledge the confidentiality...`
            );

            formData.append('designation', declarationInfo.title);
            formData.append('place', declarationInfo.place);
            formData.append('signed_date', declarationInfo.date);
            formData.append('signed_file', declarationInfo.signedFile);

            console.log('signedFile:', declarationInfo.signedFile);
            console.log('signedFile type:', typeof declarationInfo.signedFile);
            console.log('FormData preview:');

            console.log("signedFile:", declarationInfo.signedFile);
            console.log("signedFile instanceof File:", declarationInfo.signedFile instanceof File);

            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            await addDeclarations(selectedReferenceId, formData); // replace 4 with actual vendor_id

            alert("Step 5 submitted successfully!");
            nextPage(); // move to next step
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to submit declaration");
        }
    }
    // Comments state for each step to hold comments before submission
    const [comments, setComments] = useState({
        "Business Entity Details": "",
        "MSME Details": "",
        "GST Information": "",
        "Bank Details": "",
        "Documents and Attachments": "",
        "Declaration and Acknowledgement": "",
    });

    const [commentHistory, setCommentHistory] = useState({
        "Business Entity Details": [],
        "MSME Details": [],
        "GST Information": [],
        "Bank Details": [],
        "Documents and Attachments": [],
        "Declaration and Acknowledgement": [],
    });

    const updateStepComment = (stepName, value) => {
        setComments(prev => ({
            ...prev,
            [stepName]: value,
        }));
    };


    useEffect(() => {
        const fetchPreviousComments = async () => {
            try {
                const response = await getPreviousComments(selectedReferenceId);
                const data = response?.data;
                if (!data) return;
                const groupedComments = data.reduce((acc, comment) => {
                    if (!acc[comment.step]) {
                        acc[comment.step] = [];
                    }
                    acc[comment.step].push({
                        comment: comment.comment,
                        commented_on: comment.commented_on,
                        commenter_name: comment.commenter,
                    });
                    return acc;
                }, {});

                setCommentHistory((prev) => ({
                    ...prev,
                    ...groupedComments
                }));


            } catch (error) {
                console.error("Error fetching previous comments:", error);
            }
        };

        if (selectedReferenceId) {
            fetchPreviousComments();
        }
    }, [selectedReferenceId]);



    const handleSendBack = async () => {
        try {
            console.log("Submitting comments for send-back:", comments);
            const validComments = Object.entries(comments).filter(
                ([, text]) => text.trim()
            );

            if (validComments.length === 0) {
                toast.info("No comments to send.");
                return;
            }

            // Send all comments in parallel for speed
            await Promise.all(
                validComments.map(([step_name, comment_text]) =>
                    addComments(selectedReferenceId, { step_name, comment_text })
                )
            );

            const response = await sendBackRfqForCorrections(selectedReferenceId);
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
            // Your additional rejection/send-back logic can go here
        } catch (error) {
            console.error("Error submitting comments:", error);
            toast.error("Failed to submit comments.");
            return false;
        }
    };

    const handleApproveRfq = async () => {
        try {
            const payload = {
                expiry_date: expiryDate,
            };
            const response = await approveRfq(selectedReferenceId, payload);
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            toast.error("Error approving RFQ.");
            console.error("Error approving RFQ:", error);
            return false;
        }
    };



    const handleActionClick = (type) => {
        setActionType(type);
        setShowModal(true);
    };
    const handleModalSubmit = async () => {
        setIsLoading(true); // show loader when process starts
        try {
            if (actionType === "verify") {
                if (!expiryDate) {
                    toast.error("Please select expiry date.");
                    setIsLoading(false);
                    return;
                }
                toast.success(`Vendor verified successfully till ${expiryDate}`);
            }

            else if (actionType === "approve") {
                if (!expiryDate) {
                    toast.error("Please select expiry date.");
                    setIsLoading(false);
                    return;
                }
                const response = await handleApproveRfq();
                if (response === true) {
                    toast.success(`Vendor approved successfully till ${expiryDate}`);
                    setSelectedReferenceId("");
                } else {
                    toast.error("Failed to approve vendor.");
                }
            }

            else if (actionType === "reject") {
                if (!actionComment) {
                    toast.error("Please enter a rejection reason.");
                    setIsLoading(false);
                    return;
                }
                toast.success("Vendor request rejected.");
            }

            else if (actionType === "sendBack") {
                const response = await handleSendBack();
                if (response === true) {
                    toast.success("Vendor request sent back for corrections.");
                    setSelectedReferenceId("");
                } else {
                    toast.error("Failed to send back vendor request.");
                }
            }

            // ✅ reset after success
            setShowModal(false);
            setExpiryDate("");
            setActionComment("");

        } catch (error) {
            console.error("Error in modal submit:", error);
            toast.error("An error occurred while submitting action.");
        } finally {
            setIsLoading(false); // hide loader
        }
    };


    useEffect(() => {
        // Example: fetch or get status value
        const fetchedStatus = 8; // Replace with actual status from API
        setStatus(fetchedStatus);
    }, []);


    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await getVmsUserRole();
                const userRoleId = Number(response?.data?.role_id || null);
                setUserRole(userRoleId);
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };
        fetchUserRole();
    }, []);

    return (
        <Box m="50px">
            <Header
                title="All RFQ Submissions"
                subtitle="Vendor Management System"
            />

            {/* Vendor Dropdown */}
            <div className="mb-3">
                <label className="form-label">Select Vendor</label>
                <select
                    className="form-select"
                    value={selectedReferenceId}
                    onChange={handleRfqChange}
                >
                    <option value="">-- Select Vendor RFQ --</option>
                    {pendingRfqs.map((r) => (
                        <option key={r.id} value={r.reference_id}>
                            {r.reference_id} - {r.vendor_name}
                        </option>
                    ))}
                </select>

            </div>


            {/* Stepper */}
            {selectedReferenceId && (
                <div className={styles.container}>
                    <div className={styles.vmsWrapper}>
                        {/* Sidebar */}
                        <div className={styles.verticalTabs}>
                            {stepLabels.map((label, index) => (
                                <div
                                    key={index}
                                    className={`${styles.tab} ${currentPage === index ? styles.activeTab : ""
                                        } ${currentPage > index ? styles.completedTab : ""}`}
                                    onClick={() => setCurrentPage(index)}
                                >
                                    <div className={styles.tabIcon}>{index + 1}</div>
                                    <div className={styles.tabLabel}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Form content */}


                        <div className={styles.formOuter}>
                            <form>
                                {/* Step 1: Company Info */}
                                {currentPage === 0 && (

                                       <div className={styles.page}>
                                        <h3>Business Entity Details </h3>
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Full Registered Name (as per PAN)
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="full_registered_name"
                                                value={companyInfo.full_registered_name}
                                                className={`${styles.fieldInput} ${styles.uppercaseInput}`}
                                                maxLength={255}
                                                onChange={(e) => {
                                                    let input = e.target.value;

                                                    // allow letters, numbers, spaces, and common company name characters
                                                    // Allows: A-Z, a-z, 0-9, spaces, periods, hyphens, ampersands, parentheses, apostrophes
                                                    if (/^[A-Za-z0-9\s.\-&()']*$/.test(input)) {
                                                        setCompanyInfo({
                                                            ...companyInfo,
                                                            full_registered_name: input.toUpperCase(),
                                                        });
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    // ✅ when user leaves the field, clean it up finally
                                                    setCompanyInfo((prev) => ({
                                                        ...prev,
                                                        full_registered_name: prev.full_registered_name
                                                            ?.replace(/\s+/g, " ") // collapse multiple spaces
                                                            .trim()                // remove start/end spaces
                                                            .toUpperCase(),        // ensure uppercase
                                                    }));
                                                }}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Nature of Business Entity <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="business_entity_type"
                                                value={companyInfo.business_entity_type}
                                                onChange={(e) => {
                                                    handleCompanyInfoChange(e);  // keep your existing handling

                                                    const selected = e.target.value;

                                                    // Force India for these types:
                                                    const forceIndia =
                                                        selected === "Sole Proprietorship" ||
                                                        selected === "Partnership";

                                                    if (forceIndia) {
                                                        const india = countries.find(
                                                            c => c.country.toLowerCase() === "india"
                                                        );

                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "India",
                                                            isOtherCountry: false,
                                                            country_id: india?.id || null,

                                                            // reset these fields
                                                            country_text: "",
                                                            state_text: "",
                                                            state_id: "",
                                                        }));

                                                    } else {
                                                        // Reset country fields when switching to other entity types
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "",
                                                            isOtherCountry: false,
                                                            country_id: null,
                                                            state_id: "",
                                                            country_text: "",
                                                            state_text: "",
                                                        }));
                                                    }
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled
                                                  
                                            >
                                                <option value="">-- Select Business Entity Type --</option>
                                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                                                <option value="Private Limited Companies">Private Limited Companies</option>
                                                <option value="Public Limited Companies">Public Limited Companies</option>
                                                <option value="One-Person Companies">One-Person Companies</option>
                                                <option value="Section 8 Company">Section 8 Company</option>
                                                <option value="Joint-Venture Company">Joint-Venture Company</option>
                                                <option value="Non-Government Organization(NGO)">
                                                    Non-Government Organization (NGO)
                                                </option>
                                            </select>
                                        </div>


                                        {/* 🟢 Sole Proprietorship → Registration Number */}
                                        {companyInfo.business_entity_type === "Sole Proprietorship" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>

                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                    
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Partnership → Firm Registration Number */}
                                        {companyInfo.business_entity_type === "Partnership" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                    
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Limited Liability Partnership" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                    
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Private Limited Companies" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Public Limited Companies" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "One-Person Companies" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Section 8 Company" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        )}


                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Joint-Venture Company" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        )}


                                        {/* 🟢 Sole Proprietorship → Registration Number */}
                                        {companyInfo.business_entity_type === "Non-Government Organization(NGO)" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        )}

                                        <div className={styles.fieldRow}>


                                            <label className={styles.fieldLabel}>
                                                Do you have a TAN Number? <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="tanStatus"
                                                value={tanStatus}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setTanStatus(value);

                                                    // Clear TAN number whenever user selects: no OR blank option
                                                    if (value === "no" || value === "") {
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            tan_number: ""
                                                        }));
                                                    }
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled
                                                  
                                            >
                                                <option value="">-- Select --</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>

                                        {/* ✅ If YES → TAN Number input */}
                                        {tanStatus === "yes" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    TAN Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="tan_number"
                                                    value={companyInfo.tan_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    placeholder="Enter TAN Number"
                                                    required
                                                    readOnly
                                                    
                                                />


                                            </div>
                                        )}

                                        {tanStatus === "no" && (
                                            <div className={styles.fieldRow}>
                                                <p style={{ color: "red", fontWeight: "500", margin: 0, paddingLeft: "300px", }}>
                                                    ( Please upload your <strong>TDS Exemption Certificate</strong> in Step 5.)
                                                </p>
                                            </div>
                                        )}


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Trading Name
                                                <span className={styles.requiredSymbol}>*</span></label>
                                            <input
                                                type="text"
                                                name="trading_name"
                                                value={companyInfo.trading_name || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Country of Incorporation</label>

                                            <select
                                                name="country_type"
                                                value={companyInfo.country_type}
                                              
                                                className={styles.fieldInput}
                                                disabled
                                                onChange={(e) => {
                                                    const selected = e.target.value;

                                                    // ---------------------------------------
                                                    // 🟡 Case 1: User selects blank option
                                                    // ---------------------------------------
                                                    if (selected === "") {
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "",
                                                            isOtherCountry: false, // prevent auto Others
                                                            country_id: null,
                                                            state_id: "",
                                                            country_text: "",
                                                            state_text: "",
                                                        }));
                                                        return;
                                                    }

                                                    // ---------------------------------------
                                                    // 🟢 Case 2: India selected
                                                    // ---------------------------------------
                                                    if (selected === "India") {
                                                        const india = countries.find(c => c.country.toLowerCase() === "india");

                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "India",
                                                            isOtherCountry: false,
                                                            country_id: india?.id || null,
                                                            country_text: "",
                                                            state_text: "",
                                                            state_id: "",
                                                        }));

                                                        return;
                                                    } else {
                                                        setCompanyInfo((prev) => ({
                                                            ...prev,
                                                            country_type: "Others",
                                                            isOtherCountry: true,

                                                            country_id: null,
                                                            state_id: null,

                                                            country_text: "",
                                                            state_text: "",
                                                        }));
                                                    }



                                                    // ---------------------------------------
                                                    // 🔵 Case 3: Others selected
                                                    // ---------------------------------------
                                                    setCompanyInfo(prev => ({
                                                        ...prev,
                                                        country_type: "Others",
                                                        isOtherCountry: true,
                                                        country_id: null,
                                                        state_id: "",
                                                        country_text: "",
                                                        state_text: "",
                                                    }));
                                                }}
                                            >
                                                <option value="">-- Select Country --</option>
                                                <option value="India">India</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>


                                        {/* ============================
    🌎 OTHERS → COUNTRY + STATE
=============================== */}
                                        {companyInfo.isOtherCountry && (
                                            <>
                                                {/* Country Text */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Specify Country</label>
                                                    <input
                                                        type="text"
                                                        value={companyInfo.country_text}
                                                        onChange={(e) =>
                                                            setCompanyInfo(prev => ({
                                                                ...prev,
                                                                country_text: e.target.value.toUpperCase(),
                                                            }))
                                                        }
                                                        className={styles.fieldInput}
                                                        required
                                                        readOnly
                                                    />
                                                </div>

                                                {/* State Text */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>State / Province</label>
                                                    <input
                                                        type="text"
                                                        value={companyInfo.state_text}
                                                        onChange={(e) =>
                                                            setCompanyInfo(prev => ({
                                                                ...prev,
                                                                state_text: e.target.value.toUpperCase(),
                                                            }))
                                                        }
                                                        className={styles.fieldInput}
                                                        required
                                                        readOnly
                                                    />
                                                </div>
                                            </>
                                        )}


                                        {/* ============================
    🇮🇳 INDIA — STATE DROPDOWN
=============================== */}
                                        {!companyInfo.isOtherCountry && companyInfo.country_type === "India" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>State</label>
                                                <select
                                                    name="state_id"
                                                    value={companyInfo.state_id || ""}
                                                    onChange={(e) =>
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            state_id: e.target.value,
                                                        }))
                                                    }
                                                    required
                                                    disabled
                                                      
                                                    className={styles.fieldInput}
                                                >
                                                    <option value="">-- Select State --</option>
                                                    {states.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.state}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Telephone Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="telephone"
                                                value={
                                                    countryCode
                                                        ? `${countryCode} ${companyInfo.telephone}`
                                                        : companyInfo.telephone
                                                }
                                                onChange={(e) => {
                                                    // remove country code from input text safely
                                                    const input = e.target.value.replace(countryCode, "").trim();

                                                    // ✅ allow only digits (0–9)
                                                    const digitsOnly = input.replace(/[^0-9]/g, "");

                                                    setCompanyInfo({
                                                        ...companyInfo,
                                                        telephone: digitsOnly,
                                                    });
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Registered Address <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="registered_address"
                                                value={companyInfo.registered_address || ""}
                                                onChange={(e) => {
                                                    // 🏠 Clean + uppercase before updating
                                                    const cleaned = e.target.value.replace(/[^A-Za-z0-9\s,\/-]/g, "").toUpperCase();

                                                    setCompanyInfo((prev) => ({
                                                        ...prev,
                                                        registered_address: cleaned,
                                                        // ✅ If checkbox checked, sync Business Address too
                                                        ...(sameAsRegistered ? { business_address: cleaned } : {}),
                                                    }));

                                                    // If you still use handleCompanyInfoChange elsewhere, you can remove this next line.
                                                    // handleCompanyInfoChange(e); // ❌ no need if we're handling it directly here
                                                }}
                                                placeholder="Enter Registered Address"
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>

                                        {/* ✅ Checkbox for same address */}
                                        <center><div className={styles.fieldRow}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsRegistered}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSameAsRegistered(checked);
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            business_address: checked ? prev.registered_address : "",
                                                        }));
                                                    }}
                                                    disabled
                                                      
                                                />
                                                Registered Address same as Business Address
                                            </label>
                                        </div></center>

                                        {/* Business Address field */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Business Address
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="business_address"
                                                value={companyInfo.business_address || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                              
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Contact Person<span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "65%",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "6px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <select
                                                    name="contact_person_title"
                                                    value={companyInfo.contact_person_title || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        padding: "8px 10px",
                                                        width: "80px",
                                                        background: "transparent",
                                                        borderRight: "1px solid #ccc",
                                                        cursor: "pointer",
                                                    }}
                                                    required
                                                    disabled
                                                    
                                                >

                                                    <option value="Mr.">Mr.</option>
                                                    <option value="Mrs.">Mrs.</option>
                                                    <option value="Ms.">Ms.</option>
                                                </select>

                                                <input
                                                    type="text"
                                                    name="contact_person_name"
                                                    value={companyInfo.contact_person_name || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    placeholder="Enter Contact Person Name"
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        flex: 1,
                                                        padding: "8px 10px",
                                                        background: "transparent",
                                                    }}
                                                    required
                                                    readOnly
                                                    
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Contact Person Phone Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="contact_person_mobile"
                                                value={companyInfo.contact_person_mobile || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Contact Person Email ID
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="contact_person_email"
                                                value={companyInfo.contact_person_email || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Account Person<span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "65%",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "6px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <select
                                                    name="accounts_person_title"
                                                    value={companyInfo.accounts_person_title || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        padding: "8px 10px",
                                                        width: "80px",
                                                        background: "transparent",
                                                        borderRight: "1px solid #ccc",
                                                        cursor: "pointer",
                                                    }}
                                                    required
                                                    disabled
                                                    
                                                >

                                                    <option value="Mr.">Mr. </option>
                                                    <option value="Mrs.">Mrs.</option>
                                                    <option value="Ms.">Ms.</option>
                                                </select>

                                                <input
                                                    type="text"
                                                    name="accounts_person_name"
                                                    value={companyInfo.accounts_person_name || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    placeholder="Enter Account Person Name"
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        flex: 1,
                                                        padding: "8px 10px",
                                                        background: "transparent",
                                                    }}
                                                    required
                                                    readOnly
                                                    
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Accounts Person Contact Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="accounts_person_contact_no"
                                                value={companyInfo.accounts_person_contact_no || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Accounts Person Email ID
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="accounts_person_email"
                                                value={companyInfo.accounts_person_email || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly
                                                
                                            />
                                        </div>

                                    </div>


                                )}


                                {/* STEP 2: MSME */}
                                {currentPage === 1 && (
                                    <div className={styles.page}>
                                        <h3>MSME / Udyam Registration</h3>
                                        {/* 🏢 Registered under MSME Act */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Registered under MSME Act
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="registered_under_msme"
                                                value={msmeInfo.registered_under_msme || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    // Set main dropdown value
                                                    setMsmeInfo((prev) => ({
                                                        ...prev,
                                                        registered_under_msme: value,
                                                        udyam_registration_number: "" // 🔥 RESET like TAN Number logic
                                                    }));
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        {/* 🧾 Udyam Registration Number only if MSME = Yes */}
                                        {msmeInfo.registered_under_msme === "true" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Udyam Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    name="udyam_registration_number"
                                                    value={msmeInfo.udyam_registration_number || ""}
                                                    onChange={(e) =>
                                                        setMsmeInfo((prev) => ({
                                                            ...prev,
                                                            udyam_registration_number: e.target.value
                                                        }))
                                                    }
                                                    className={styles.fieldInput}
                                                    placeholder="Enter Udyam Registration Number"
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        )}

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Category (Micro/Small/Medium)
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                name="category"
                                                value={msmeInfo?.category}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                disabled

                                            >
                                                <option value="">Select</option>
                                                <option value="Micro">Micro</option>
                                                <option value="Small">Small</option>
                                                <option value="Medium">Medium</option>
                                            </select>
                                        </div>

                                    </div>
                                )}
                                {/* STEP 3: GST */}
                                {/* STEP 3: Goods and Services Supplied */}
                                {currentPage === 2 && (
                                    <div className={styles.page}>


                                        <div className={styles.fieldRow} >
                                            <label className={styles.fieldLabel}>Type of Counterparty Business</label>
                                            <select
                                                name="type_of_counterparty"
                                                value={goodsServices.type_of_counterparty}
                                                onChange={(e) => handleGoodsServicesChange(e, 'goodsServices')}
                                                className={styles.fieldInput}
                                                //required
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="Trading Entity">Trading Entity</option>
                                                <option value="End-Use">End-Use</option>
                                                <option value="Manufacturer">Manufacturer</option>
                                                <option value="Service Provider">Service provider</option>
                                                <option value="Third Party Payer / Reciever of funds">Third party payer/receiver of funds</option>
                                                <option value="Others">Others</option>
                                            </select>

                                            {goodsServices.type_of_counterparty === 'Others' && (
                                                <input
                                                    type="text"
                                                    name="others"
                                                    value={goodsServices.others}
                                                    onChange={(e) => handleGoodsServicesChange(e, 'goodsServices')}
                                                    placeholder="Please specify other business type"
                                                    className={styles.fieldInput}
                                                    //required
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <h3>Details of the Supplies</h3>
                                        <div className={styles.gsForm_container}>
                                            {/* ========== GOODS SECTION ========== */}
                                            <div className={styles.gsForm_section}>
                                                <div className={styles.gsForm_header}>
                                                    <label className={styles.gsForm_label}>Goods</label>
                                                    {goods.length < 5 && (
                                                        <button
                                                            type="button"
                                                            onClick={gsForm_addGoods}
                                                            className={styles.gsForm_addBtn}
                                                            disabled
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={styles.gsForm_group}>
                                                    {goods.map((value, index) => (
                                                        <div key={index} className={styles.gsForm_row}>
                                                            <input
                                                                type="text"
                                                                value={value}
                                                                onChange={(e) => gsForm_changeGoods(index, e.target.value)}
                                                                placeholder="Enter goods"
                                                                className={styles.gsForm_input}
                                                                //required
                                                                readOnly
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => gsForm_deleteGoods(index)}
                                                                className={styles.gsForm_deleteBtn}
                                                                disabled
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}

                                                </div>
                                            </div>

                                            {/* ========== SERVICES SECTION ========== */}
                                            <div className={styles.gsForm_section}>
                                                <div className={styles.gsForm_header}>
                                                    <label className={styles.gsForm_label}>Services</label>
                                                    {services.length < 5 && (
                                                        <button
                                                            type="button"
                                                            onClick={gsForm_addService}
                                                            className={styles.gsForm_addBtn}
                                                            disabled
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={styles.gsForm_group}>
                                                    {services.map((value, index) => (
                                                        <div key={index} className={styles.gsForm_row}>
                                                            <input
                                                                type="text"
                                                                value={value}
                                                                onChange={(e) => gsForm_changeService(index, e.target.value)}
                                                                placeholder="Enter services"
                                                                className={styles.gsForm_input}
                                                                //required
                                                                readOnly
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => gsForm_deleteService(index)}
                                                                className={styles.gsForm_deleteBtn}
                                                                disabled
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* ========== GOODS & SERVICES SECTION ========== */}
                                            <div className={styles.gsForm_section}>
                                                <div className={styles.gsForm_header}>
                                                    <label className={styles.gsForm_label}>Goods and Services</label>
                                                    {goodsAndServices.length < 5 && (
                                                        <button
                                                            type="button"
                                                            onClick={gsForm_addGoodsServicesRow}
                                                            className={styles.gsForm_addBtn}
                                                            disabled
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={styles.gsForm_group}>
                                                    {goodsAndServices.map((item, index) => (
                                                        <div key={index} className={styles.gsForm_combinedRow}>
                                                            <input
                                                                type="text"
                                                                value={item.goods}
                                                                onChange={(e) =>
                                                                    gsForm_changeGoodsServices(index, "goods", e.target.value)
                                                                }
                                                                placeholder="Enter goods"
                                                                className={styles.gsForm_input}
                                                                //required
                                                                readOnly
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.services}
                                                                onChange={(e) =>
                                                                    gsForm_changeGoodsServices(index, "services", e.target.value)
                                                                }
                                                                placeholder="Enter services"
                                                                className={styles.gsForm_input}
                                                                readOnly
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => gsForm_deleteGoodsServices(index)}
                                                                className={styles.gsForm_deleteBtn}
                                                                disabled
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <h3>GST Registrations</h3>
                                        {/* Number selection */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Number of GST Registrations (max 28)</label>
                                            <select
                                                className={styles.fieldInput}
                                                value={count}
                                                onChange={handleCountChange}
                                                //required
                                                disabled
                                            >
                                                <option value={0}>Select</option>
                                                {[...Array(28)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {i + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Dynamic registration fields */}
                                        {gstformData.map((item, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    border: "1px solid #ddd",
                                                    padding: "20px",
                                                    borderRadius: "8px",
                                                    marginBottom: "24px",
                                                    backgroundColor: "#fdfdfd",
                                                }}
                                            >
                                                <h4 style={{ marginBottom: "16px", color: "#333" }}>
                                                    Registration {i + 1}
                                                </h4>

                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>State Name</label>
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={item.state}
                                                        onChange={(e) => handleGstFieldChange(i, "state", e.target.value)}
                                                        //required
                                                        disabled
                                                    >
                                                        <option value="">Select State</option>
                                                        {states.map((state) => (
                                                            <option key={state.id} value={state.id}>
                                                                {state.state}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>GST Number (15 digits)</label>
                                                    <input
                                                        type="text"
                                                        maxLength={15}
                                                        className={styles.fieldInput}
                                                        value={item.gstNumber}
                                                        onChange={(e) => handleGstFieldChange(i, "gstNumber", e.target.value)}
                                                        placeholder="Enter GSTIN"
                                                        //required
                                                        readOnly
                                                    />
                                                </div>

                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Registration Date</label>
                                                    <input
                                                        type="date"
                                                        className={styles.fieldInput}
                                                        value={item.regDate}
                                                        onChange={(e) => handleGstFieldChange(i, "regDate", e.target.value)}
                                                        //required
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        ))}



                                        {/* Registration Type Dropdown */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Registration Type</label>
                                            <select
                                                value={gstMeta.reg_type}
                                                onChange={(e) => setGstMeta(prev => ({ ...prev, reg_type: e.target.value }))}
                                                className={styles.fieldInput}
                                                //required
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="Regular">Regular</option>
                                                <option value="Composition">Composition</option>
                                                <option value="Regular SEZ">Regular SEZ</option>
                                            </select>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Periodicity of GSTR-1</label>
                                            <select
                                                value={gstMeta.periodicity_gstr1}
                                                onChange={(e) => setGstMeta(prev => ({ ...prev, periodicity_gstr1: e.target.value }))}
                                                className={styles.fieldInput}
                                                //required
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Quarterly">Quarterly</option>
                                            </select>
                                        </div>


                                        <h3>Income Tax Details</h3>

                                        <table className={styles?.incomeTaxTable || "incomeTaxTable"}>
                                            <thead>
                                                <tr>
                                                    <th colSpan="4" className={styles?.tableSubtitle}>
                                                        Details of Turnover for the Last 3 Financial Years
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th>Particulars</th>
                                                    <th>Financial Year - I</th>
                                                    <th>Financial Year - II</th>
                                                    <th>Financial Year - III</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {/* Financial Year */}
                                                <tr>
                                                    <td>Financial Year</td>
                                                    <td>
                                                        <select name="fy1"
                                                            value={formData.fy1}
                                                            onChange={handleIncomeChange}
                                                            //required
                                                            disabled
                                                        >
                                                            <option value="">Select</option>
                                                            {getFilteredYears("fy1").map((fy) => (
                                                                <option key={fy} value={fy}>
                                                                    {fy}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <select
                                                            name="fy2"
                                                            value={formData.fy2}
                                                            onChange={handleIncomeChange}
                                                            disabled={!formData.fy1}
                                                        //required

                                                        >
                                                            <option value="">Select</option>
                                                            {getFilteredYears("fy2").map((fy) => (
                                                                <option key={fy} value={fy}>
                                                                    {fy}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <select
                                                            name="fy3"
                                                            value={formData.fy3}
                                                            onChange={handleIncomeChange}
                                                            disabled={!formData.fy2}
                                                        //required

                                                        >
                                                            <option value="">Select</option>
                                                            {getFilteredYears("fy3").map((fy) => (
                                                                <option key={fy} value={fy}>
                                                                    {fy}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>

                                                {/* Turnover field — allows 0 and positive numbers */}
                                                <tr>
                                                    <td>Turnover</td>
                                                    {[1, 2, 3].map((i) => (
                                                        <td key={i}>
                                                            <input
                                                                type="number"
                                                                name={`turnover${i}`}
                                                                value={formData[`turnover${i}`]}
                                                                onChange={handleIncomeChange}
                                                                min="0" // ✅ allows 0 and positive
                                                                onWheel={(e) => e.target.blur()} // prevent scroll changing value
                                                                //required
                                                                readOnly
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* ITR Status */}
                                                <tr>
                                                    <td>Status of ITR filed (Yes/No)</td>
                                                    {[1, 2, 3].map((i) => (
                                                        <td key={i}>
                                                            <select name={`itrStatus${i}`}
                                                                value={formData[`itrStatus${i}`]}
                                                                onChange={handleIncomeChange}
                                                                //required
                                                                disabled
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="Yes">Yes</option>
                                                                <option value="No">No</option>
                                                            </select>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* ITR Acknowledgment */}
                                                <tr>
                                                    <td>ITR Acknowledgment No.</td>
                                                    {[1, 2, 3].map((i) => (
                                                        <td key={i}>
                                                            <input type="text"
                                                                name={`ackNo${i}`}
                                                                value={formData[`ackNo${i}`]}
                                                                onChange={handleIncomeChange}
                                                                //required
                                                                readOnly
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Filed Date */}
                                                <tr>
                                                    <td>ITR Filed Date</td>
                                                    {[1, 2, 3].map((i) => (
                                                        <td key={i}>
                                                            <input type="date"
                                                                name={`filedDate${i}`}
                                                                value={formData[`filedDate${i}`]}
                                                                onChange={handleIncomeChange}
                                                                //required
                                                                readOnly />
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Counterparty Business */}

                                        {/* Navigation Buttons */}


                                    </div>
                                )}


                                {/* STEP 3: Banking & Further Information */}
                                {currentPage === 3 && (
                                    <div className={styles.page}>
                                        <h3>Banking Information</h3>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Account Holder’s Name</label>
                                            <input
                                                type="text"
                                                name="account_holder_name"
                                                value={bankInfo.account_holder_name}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Bank Name</label>
                                            <input
                                                type="text"
                                                name="bank_name"
                                                value={bankInfo.bank_name}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Bank Address</label>
                                            <input
                                                type="text"
                                                name="bank_address"
                                                value={bankInfo.bank_address}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={bankInfo.country}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Account Number</label>
                                            <input
                                                type="text"
                                                name="account_number"
                                                value={bankInfo.account_number}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>IFSC Code</label>
                                            <input
                                                type="text"
                                                name="ifsc_code"
                                                value={bankInfo.ifsc_code}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>SWIFT Code</label>
                                            <input
                                                type="text"
                                                name="swift_code"
                                                value={bankInfo.swift_code}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Beneficiary of the Account</label>
                                            <input
                                                type="text"
                                                name="beneficiary_name"
                                                value={bankInfo.beneficiary_name}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <h3 className={styles.subHeading}>Further Information</h3>
                                        <p>
                                            Please answer the following questions (to the best of your knowledge):
                                        </p>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Will the proposed business involve a third party acting on your behalf (e.g., an intermediary or agent)?
                                            </label>
                                            <select
                                                name="involves_third_party"
                                                value={bankInfo.involves_third_party ?? ""} // This converts true/false to "true"/"false"
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Will you use a third party or subcontractor to act on your behalf or make/receive payments in relation to the proposed business relationship with any sanctioned country?
                                            </label>
                                            <select
                                                name="subcontractor_in_sanctioned_country"
                                                value={bankInfo.subcontractor_in_sanctioned_country ?? ""}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                //required
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>




                                    </div>
                                )}

                                {/* STEP 4: Documents to be enclosed */}
                                {currentPage === 4 && (
                                    <div className={styles.page}>
                                        <h3>Documents to be enclosed</h3>

                                        {/* PAN */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>PAN</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ hidden input
                                            />

                                            {documents.pan?.url && (
                                                <a
                                                    href={documents.pan.url.startsWith("blob:")
                                                        ? documents.pan.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.pan.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}

                                                >
                                                    View PAN
                                                </a>
                                            )}
                                        </div>

                                        {/* GSTIN */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>GSTIN</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ hidden input
                                            />

                                            {documents.gstin?.url && (
                                                <a
                                                    href={documents.gstin.url.startsWith("blob:")
                                                        ? documents.gstin.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.gstin.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}

                                                >
                                                    View GSTIN
                                                </a>
                                            )}
                                        </div>

                                        {/* MSME Certificate */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>MSME Certificate (if any)</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ hidden input
                                            />

                                            {documents.msme?.url && (
                                                <a
                                                    href={documents.msme.url.startsWith("blob:")
                                                        ? documents.msme.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.msme.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}

                                                >
                                                    View MSME Certificate
                                                </a>
                                            )}
                                        </div>

                                        {/* Cancelled Cheque Leaf */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Cancelled Cheque Leaf</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ hidden input
                                            />

                                            {documents.cheque?.url && (
                                                <a
                                                    href={documents.cheque.url.startsWith("blob:")
                                                        ? documents.cheque.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.cheque.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View Cancelled Cheque Leaf
                                                </a>
                                            )}
                                        </div>

                                        {/* TAN */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>TAN</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ hidden input
                                            />

                                            {documents.tan?.url && (
                                                <a
                                                    href={documents.tan.url.startsWith("blob:")
                                                        ? documents.tan.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.tan.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View TAN
                                                </a>
                                            )}
                                        </div>

                                        {/* Certificate of Incorporation / Firm Registration */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Certificate of Incorporation / Firm Registration</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ hidden input
                                            />

                                            {documents.incorporation?.url && (
                                                <a
                                                    href={documents.incorporation.url.startsWith("blob:")
                                                        ? documents.incorporation.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.incorporation.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View Certificate of Incorporation
                                                </a>
                                            )}
                                        </div>

                                        {/* TDS Declaration for Exemption */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>TDS Declaration for Exemption</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ hidden input
                                            />

                                            {documents.tds?.url && (
                                                <a
                                                    href={documents.tds.url.startsWith("blob:")
                                                        ? documents.tds.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.tds.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View TDS Declaration
                                                </a>
                                            )}
                                        </div>




                                    </div>
                                )}

                                {/* STEP 6: Declaration & Confidentiality */}
                                {currentPage === 5 && (
                                    <div className={styles.page}>
                                        <h3>Declaration</h3>
                                        <p className={styles.paragraph}>
                                            I/We{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo?.name}
                                                onChange={handleDeclarationChange}
                                                placeholder="Your Name"
                                                name="name"
                                                //required
                                                readOnly
                                            />{" "}
                                            of{" "}
                                            <input
                                                type="text"
                                                value={declarationInfo.organization}
                                                className={styles.inlineInput}
                                                onChange={handleDeclarationChange}
                                                placeholder="Your Organization"
                                                name="organization"
                                                //required
                                                readOnly
                                            />{" "}
                                            designated as{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo.designation}
                                                onChange={handleDeclarationChange}
                                                placeholder="Designation"
                                                name="designation"
                                                //required
                                                readOnly
                                            />{" "}
                                            declare the information provided in this document is true and accurate in
                                            all respects and that we have performed such procedures and inquiries as
                                            necessary to verify the answers; and
                                        </p>

                                        <h3>Confidentiality and Data Privacy</h3>
                                        <p className={styles.paragraph}>
                                            I/We{" "}
                                            <input
                                                type="text"
                                                value={declarationInfo.confidentiality_name}
                                                className={styles.inlineInput}
                                                onChange={handleDeclarationChange}
                                                placeholder="Your Name"
                                                name="confidentiality_name"
                                                //required
                                                readOnly
                                            />{" "}
                                            of{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo.confidentiality_org}
                                                onChange={handleDeclarationChange}
                                                placeholder="Organization"
                                                name="confidentiality_org"
                                                //required
                                                readOnly
                                            />{" "}
                                            designated as{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo?.confidentiality_designation}
                                                onChange={handleDeclarationChange}
                                                placeholder="Designation"
                                                name="confidentiality_designation"
                                                //required
                                                readOnly
                                            />{" "}
                                            acknowledge that the contents of this document and of any of the documents
                                            enclosed hereto may be shared, used, and stored by ABGT and its affiliates
                                            worldwide in connection with the administration of the parties'
                                            relationship or as otherwise required by applicable laws or regulations.
                                        </p>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Authorized Signatory</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{ display: "none" }}      // ✅ completely hidden
                                            />

                                            {declarationInfo.signedFile && (
                                               <a
                                                    href={typeof declarationInfo.signedFile === "object" &&
                                                        declarationInfo.signedFile.url?.startsWith("blob:")
                                                        ? declarationInfo.signedFile.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${declarationInfo.signedFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View Signed Document
                                                </a>
                                            )}
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Title</label>
                                            <input type="text"
                                                className={styles.fieldInput}
                                                value={declarationInfo.title}
                                                onChange={handleDeclarationChange}
                                                placeholder="Title"
                                                name="title"
                                                //required
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Date</label>
                                            <input type="date"
                                                className={styles.fieldInput}
                                                value={declarationInfo.date}
                                                onChange={handleDeclarationChange}
                                                placeholder="Date"
                                                name="date"
                                                //required
                                                readOnly
                                            />

                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Place</label>
                                            <input type="text"
                                                className={styles.fieldInput}
                                                value={declarationInfo.place}
                                                onChange={handleDeclarationChange}
                                                placeholder="Place"
                                                name="place"
                                                //required
                                                readOnly
                                            />
                                        </div>




                                        {showModal && (
                                            <div className={styles.modalOverlay}>
                                                <div className={styles.modalContent}>
                                                    <h3 style={{ textTransform: "capitalize" }}>{actionType} Request</h3>

                                                    {/* ✅ Verify or Approve Section */}
                                                    {(actionType === "verify" || actionType === "approve") && (
                                                        <>
                                                            <label>Expiry Date</label>
                                                            <input
                                                                type="date"
                                                                value={expiryDate}
                                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                                min={today}  // ✅ No past dates
                                                            />
                                                        </>
                                                    )}

                                                    {/* ✅ Reject or Send Back Section */}
                                                    {(actionType === "sendBack") && (
                                                        <>
                                                            <p style={{
                                                                color: "#000",
                                                                border: "none",
                                                                fontSize: "17px",
                                                            }}>
                                                                Are you sure want to Send Back the RFI to the vendor
                                                            </p>
                                                        </>
                                                    )}
                                                    {(actionType === "reject") && (
                                                        <>
                                                            <p style={{
                                                                color: "#000",
                                                                border: "none",
                                                                fontSize: "17px",
                                                            }}>
                                                                Are you sure want to Reject the RFI from the vendor
                                                            </p>
                                                        </>
                                                    )}

                                                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={handleModalSubmit}
                                                            disabled={isLoading} // disable while loading
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <span
                                                                        className="spinner-border spinner-border-sm me-2"
                                                                        role="status"
                                                                        aria-hidden="true"
                                                                    ></span>
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                "Submit"
                                                            )}
                                                        </button>
                                                        <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                                    </div>

                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}
                                {/* 🔹 Dynamic Comments Section (for all steps) */}
                                <div className="mt-4" >

                                    {/* ===== LABEL ===== */}
                                    <label
                                        className={styles.fieldLabel}
                                        style={{
                                            marginBottom: "10px",
                                            marginTop: "50px",
                                            display: "flex",
                                            alignItems: "center",
                                            whiteSpace: "nowrap",
                                            fontSize: "15px",
                                            gap: "6px",
                                        }}
                                    >
                                        <span style={{ fontSize: "25px", flexShrink: 0, fontWeight: 500 }}>Comments for</span>
                                        <span style={{ fontSize: "25px", fontWeight: 500 }}>{stepLabels[currentPage]}</span>
                                    </label>

                                    {/* ===== COMMENTS HISTORY TABLE ===== */}
                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            border: "1px solid #ddd",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <thead style={{ backgroundColor: "#eee" }}>
                                            <tr>
                                                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", color: "#000" }}>S.No</th>
                                                <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Comment</th>
                                                <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Commenter Name</th>
                                                <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {/* ✅ Table rows change dynamically per step */}
                                            {commentHistory[stepLabels[currentPage]] &&
                                                commentHistory[stepLabels[currentPage]].length > 0 ? (
                                                commentHistory[stepLabels[currentPage]].map((item, index) => (
                                                    <tr key={index}>
                                                        <td
                                                            style={{
                                                                border: "1px solid #ddd",
                                                                padding: "8px",
                                                                textAlign: "center",
                                                                color: "#000"
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </td>
                                                        <td style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>{item.comment}</td>
                                                        <td style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>{item.commenter_name}</td>
                                                        <td style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>{item.commented_on}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: "center", padding: "10px", color: "#000" }}>
                                                        No comments yet for this step.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* ===== DYNAMIC BUTTONS (Previous Left, Next Right) ===== */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between", // ⚡ Aligns one left & one right
                                            marginTop: "15px",
                                        }}
                                    >
                                        {/* Previous Button (Left) */}
                                        {currentPage > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                                style={{
                                                    backgroundColor: "#6c757d",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "8px 16px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Previous
                                            </button>
                                        ) : (
                                            <div></div> // placeholder to maintain spacing
                                        )}

                                        {/* Next Button (Right) */}
                                        {currentPage < stepLabels.length - 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                style={{
                                                    backgroundColor: "#007bff",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "8px 16px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Next
                                            </button>
                                        ) : null} {/* Removed other buttons */}
                                    </div>

                                </div>




                            </form>

                        </div>
                    </div>
                </div>

            )}
        </Box>
    );
};

export default RfqFormData;
