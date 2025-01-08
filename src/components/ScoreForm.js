// src/components/ScoreForm.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./ScoreForm.css";

const ScoreForm = ({ onSubmit, comparisonMode, defaultIdentity, scoreStoredToday }) => {
    const [identity1, setIdentity1] = useState(defaultIdentity || "");
    const [identity2, setIdentity2] = useState("");
    const [error, setError] = useState(""); // State for error messages

    useEffect(() => {
        if (defaultIdentity) {
            setIdentity1(defaultIdentity);
        }
    }, [defaultIdentity]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(""); // Reset error message
        if (comparisonMode) {
            if (identity1 && identity2) {
                onSubmit([identity1, identity2]);
            } else {
                setError("Please enter both identities for comparison.");
            }
        } else {
            if (identity1) {
                onSubmit([identity1]);
            } else {
                setError("Please enter your identity.");
            }
        }
    };

    return (
        <form className="score-form" onSubmit={handleSubmit}>
            {/* Label for the first identity input */}
            <div className="form-group">
                <label htmlFor="identity1" className="form-label">
                    Your Handle
                </label>
                <input
                    type="text"
                    id="identity1"
                    className="form-input"
                    placeholder="handle.bsky.social"
                    value={identity1}
                    onChange={(e) => setIdentity1(e.target.value)}
                    disabled={!!defaultIdentity} // Disable if defaultIdentity is provided
                    required // Add required attribute for form validation
                />
            </div>

            {/* Conditional Label and Input for the second identity in comparison mode */}
            {comparisonMode && (
                <div className="form-group">
                    <label htmlFor="identity2" className="form-label">
                        Compare With
                    </label>
                    <input
                        type="text"
                        id="identity2"
                        className="form-input"
                        placeholder="handle.bsky.social"
                        value={identity2}
                        onChange={(e) => setIdentity2(e.target.value)}
                        required // Add required attribute for form validation
                    />
                </div>
            )}

            {/* Display Inline Error Message */}
            {error && <p className="form-error">{error}</p>}

            {/* Submit Button */}
            <button type="submit" className="submit-button" disabled={scoreStoredToday}>
                {scoreStoredToday
                    ? "Score Logged for Today"
                    : comparisonMode
                    ? "Compare Scores"
                    : "Get Score"}
            </button>
        </form>
    );
};

ScoreForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    comparisonMode: PropTypes.bool.isRequired,
    defaultIdentity: PropTypes.string,
    scoreStoredToday: PropTypes.bool.isRequired,
};

ScoreForm.defaultProps = {
    defaultIdentity: "",
};

export default ScoreForm;
