# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

EXCEL_FILE = 'financial_profiles.xlsx'

def initialize_excel():
    if not os.path.exists(EXCEL_FILE):
        # Create initial DataFrame with columns
        df = pd.DataFrame(columns=[
            'submission_date',
            # Personal Information
            'full_name', 'date_of_birth', 'email', 'phone', 'address', 'country',
            # Employment Details
            'employment_status', 'employer_name', 'job_title', 'annual_income',
            # Financial Information
            'bank_name', 'account_type', 'net_worth', 'tax_filing_status',
            # Investment Profile
            'investment_experience', 'risk_tolerance', 'investment_goals', 'investment_timeline',
            # Security Information
            'id_type', 'id_number', 'tax_id_number'
        ])
        df.to_excel(EXCEL_FILE, index=False)
        print(f"Created new Excel file: {EXCEL_FILE}")

def append_to_excel(data):
    try:
        # Read existing Excel file
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE)
        else:
            df = pd.DataFrame()
        
        # Add submission date
        data['submission_date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Append new data
        new_df = pd.DataFrame([data])
        df = pd.concat([df, new_df], ignore_index=True)
        
        # Save back to Excel
        df.to_excel(EXCEL_FILE, index=False)
        return True
    except Exception as e:
        print(f"Error saving to Excel: {str(e)}")
        return False

@app.route('/api/profile', methods=['POST'])
def save_profile():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Save to Excel
        if append_to_excel(data):
            return jsonify({
                'success': True,
                'message': 'Profile saved successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Error saving profile'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/profile', methods=['GET'])
def get_profiles():
    try:
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE)
            return jsonify({
                'success': True,
                'data': df.to_dict('records')
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No profiles found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    initialize_excel()
    app.run(debug=True, port=5015)