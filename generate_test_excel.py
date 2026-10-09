#!/usr/bin/env python3
"""
Generate test Excel file for GeoMorph coordinate converter
"""

try:
    import openpyxl
    from openpyxl import Workbook
except ImportError:
    print("Error: openpyxl not installed. Install with: pip install openpyxl")
    exit(1)

# Create workbook
wb = Workbook()
ws = wb.active
ws.title = "Coordenadas"

# Headers
ws.append(["ID", "Nombre", "Latitud", "Longitud", "Descripcion"])

# Sample data (Madrid and nearby cities in Spain)
data = [
    [1, "Madrid", 40.416775, -3.703790, "Capital de España"],
    [2, "Barcelona", 41.385064, 2.173404, "Capital de Cataluña"],
    [3, "Valencia", 39.469907, -0.376288, "Capital de la Comunidad Valenciana"],
    [4, "Sevilla", 37.389092, -5.984459, "Capital de Andalucía"],
    [5, "Bilbao", 43.262985, -2.935013, "Capital de Vizcaya"],
    [6, "Toledo", 39.862831, -4.027323, "Ciudad histórica"],
    [7, "Segovia", 40.942820, -4.108950, "Ciudad con acueducto romano"],
    [8, "Salamanca", 40.965324, -5.663532, "Ciudad universitaria"],
    [9, "Santiago", 42.878213, -8.544844, "Santiago de Compostela"],
    [10, "Zaragoza", 41.648823, -0.889085, "Capital de Aragón"]
]

for row in data:
    ws.append(row)

# Save file
filename = "coordenadas_prueba.xlsx"
wb.save(filename)
print(f"✓ Archivo de prueba creado: {filename}")
print(f"✓ {len(data)} coordenadas incluidas")
print(f"\nPuedes usar este archivo en la pestaña 'Conversión por Excel' de GeoMorph")
