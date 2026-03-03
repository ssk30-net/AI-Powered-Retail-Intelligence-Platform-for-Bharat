#!/usr/bin/env python3
"""
Standalone script to generate dummy commodity price data and save as CSV, XLSX, or JSON.
Not part of the application — run directly: python generate_dummy_data.py

Requirements:
  - Python 3.7+
  - For XLSX output: pip install openpyxl

Usage:
  python generate_dummy_data.py
  Then follow the prompt to choose format (csv, xlsx, json) and optional filename.
"""

import csv
import json
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List


# Commodities with base price (₹) and daily volatility for realistic variation
COMMODITIES = [
    ("Wheat", 2100, 0.02),
    ("Rice", 3200, 0.015),
    ("Cabbage", 280, 0.04),
    ("Brinjal", 850, 0.03),
    ("Potato", 450, 0.025),
    ("Cucumber", 3200, 0.035),
    ("Green Chilli", 14000, 0.04),
    ("Banana", 600, 0.02),
    ("Tomato", 2200, 0.05),
    ("Onion", 1800, 0.03),
]
REGIONS = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"]
DEFAULT_DAYS = 90
OUTPUT_DIR = Path(__file__).resolve().parent


def generate_rows(
    num_days: int = DEFAULT_DAYS,
    include_region: bool = True,
    include_volume: bool = True,
) -> List[Dict[str, Any]]:
    """Generate list of dicts: commodity, price, date, [region], [volume]."""
    end_date = datetime.utcnow().date()
    rows = []
    for name, base_price, volatility in COMMODITIES:
        price = float(base_price)
        for d in range(num_days):
            record_date = end_date - timedelta(days=d)
            # Random walk
            price = price * (1 + random.gauss(0, volatility))
            price = round(max(price, 10), 2)
            row = {
                "commodity": name,
                "price": price,
                "date": record_date.strftime("%Y-%m-%d"),
            }
            if include_region:
                row["region"] = random.choice(REGIONS)
            if include_volume:
                row["volume"] = round(random.uniform(50, 500), 2)
            rows.append(row)
    return rows


def save_csv(rows: List[Dict[str, Any]], path: Path) -> None:
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def save_json(rows: List[Dict[str, Any]], path: Path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)


def save_xlsx(rows: List[Dict[str, Any]], path: Path) -> None:
    try:
        import openpyxl
    except ImportError:
        print("XLSX support requires openpyxl. Install with: pip install openpyxl")
        return
    if not rows:
        return
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Price History"
    headers = list(rows[0].keys())
    for col, key in enumerate(headers, 1):
        ws.cell(row=1, column=col, value=key)
    for row_idx, row in enumerate(rows, 2):
        for col_idx, key in enumerate(headers, 1):
            val = row[key]
            if isinstance(val, (int, float)) and key == "price":
                ws.cell(row=row_idx, column=col_idx, value=val)
            else:
                ws.cell(row=row_idx, column=col_idx, value=val)
    wb.save(path)


def main():
    print("Dummy commodity price data generator")
    print("------------------------------------")
    num_days = input(f"Number of days of data per commodity [{DEFAULT_DAYS}]: ").strip() or str(DEFAULT_DAYS)
    try:
        num_days = int(num_days)
        num_days = max(1, min(num_days, 365 * 2))
    except ValueError:
        num_days = DEFAULT_DAYS

    include_region = input("Include 'region' column? [Y/n]: ").strip().lower() != "n"
    include_volume = input("Include 'volume' column? [Y/n]: ").strip().lower() != "n"

    print("\nOutput format: 1=CSV, 2=XLSX, 3=JSON")
    choice = input("Choose format (1/2/3) [1]: ").strip() or "1"

    default_name = "dummy_price_data"
    name = input(f"Output filename (without extension) [{default_name}]: ").strip() or default_name
    name = name.replace(" ", "_")

    rows = generate_rows(num_days=num_days, include_region=include_region, include_volume=include_volume)
    print(f"Generated {len(rows)} rows for {len(COMMODITIES)} commodities.")

    if choice == "2":
        ext = "xlsx"
        path = OUTPUT_DIR / f"{name}.{ext}"
        save_xlsx(rows, path)
    elif choice == "3":
        ext = "json"
        path = OUTPUT_DIR / f"{name}.{ext}"
        save_json(rows, path)
    else:
        ext = "csv"
        path = OUTPUT_DIR / f"{name}.{ext}"
        save_csv(rows, path)

    if path.exists():
        print(f"Saved: {path}")
    else:
        print("Save failed or skipped (e.g. missing openpyxl for XLSX).")


if __name__ == "__main__":
    main()
