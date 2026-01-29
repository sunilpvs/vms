// src/pages/admin/InitiateVendor.js
import { useState } from "react";
import CreateRfqForm from "./CreateRfqForm";
import { addRfq } from "../../services/vms/initiateVendor";
import { toast } from "react-hot-toast";

const CreateRfq = () => {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        try {
            const res = await addRfq(formData);
            if (res?.data?.error) {
                toast.error(res.data.error);
            } else {
                toast.success(res.data.message || "Vendor added successfully");
                setSubmitted(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Something went wrong");
            console.error("Submit failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <h3 className="mb-4">Initiate RFI</h3>
                    {!submitted ? (
                        <CreateRfqForm onSubmit={handleSubmit} isLoading={isLoading} />
                    ) : (
                        <div className="alert alert-success">
                            Vendor successfully submitted.
                            {/*Reference ID: {form}*/}
                            <button className="btn btn-link p-0 ms-2" onClick={handleReset}>
                                Add another
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateRfq;
