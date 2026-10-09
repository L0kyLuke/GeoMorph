# Implementation Plan: GeoMorph - Coordinate Converter

## Overview

This implementation plan breaks down the GeoMorph coordinate converter into incremental, actionable tasks. The approach prioritizes building the core conversion engine first, then the validation layer, followed by the UI for individual conversions, and finally the Excel bulk processing functionality. Each task builds on previous work to ensure a fully integrated, end-to-end application.

## Tasks

- [x] 1. Set up project structure and core dependencies
  - Initialize project with package.json
  - Install core dependencies: React, file handling libraries (FileSaver.js), Excel library (xlsx or exceljs)
  - Set up basic folder structure: src/components, src/services, src/utils, src/models
  - Configure build tools (Vite, Create React App, or similar)
  - _Requirements: 30_

- [x] 2. Implement coordinate data models and type definitions
  - [x] 2.1 Create data model files for DDCoordinate, UTMCoordinate, DMSCoordinate, and DMSComponent
    - Define JavaScript classes or plain object structures with validation rules
    - Include precision configuration structures
    - _Requirements: 1.6, 19_
  
  - [x] 2.2 Create ConversionConfig and ExcelColumnConfig data models
    - Define configuration structures for conversion settings
    - Define column mapping structures for Excel processing
    - _Requirements: 14, 25_

- [x] 3. Implement core coordinate conversion engine
  - [x] 3.1 Create ConversionEngine module with WGS84 constants
    - Define ellipsoid parameters (a=6378137.0, e=0.0818191908426, k0=0.9996)
    - Create helper functions for meridional arc and footpoint latitude calculations
    - _Requirements: 5.4_
  
  - [x] 3.2 Implement DD to UTM conversion algorithm
    - Write convertDDtoUTM function following design pseudocode
    - Calculate UTM zone, hemisphere, and band
    - Apply false easting (500000m) and false northing (10000000m for southern hemisphere)
    - Round results to specified precision
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8_
  
  - [x] 3.3 Implement UTM band calculation helper
    - Write calculateUTMBand function
    - Handle latitude ranges [-80, 84] with 8-degree bands
    - Implement Svalbard exception (band X for 72-84°)
    - _Requirements: 26.1, 26.2, 26.3, 26.4_
  
  - [x] 3.4 Implement UTM to DD conversion algorithm
    - Write convertUTMtoDD function following design pseudocode
    - Remove false easting/northing
    - Calculate footpoint latitude and iterate to solution
    - Calculate central meridian and apply coordinate transformations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 3.5 Implement DD to DMS conversion algorithm
    - Write convertDDtoDMS function
    - Extract degrees, minutes, and seconds from decimal degrees
    - Determine N/S/E/W directions based on sign
    - Handle rollover edge cases (seconds=60 → minutes+1)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_
  
  - [x] 3.6 Implement DMS to DD conversion algorithm
    - Write convertDMStoDD function
    - Calculate decimal degrees from degrees + minutes/60 + seconds/3600
    - Apply negative sign for S and W directions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 3.7 Implement conversion chaining for indirect format pairs
    - Write convertUTMtoDMS (chain UTM→DD→DMS)
    - Write convertDMStoUTM (chain DMS→DD→UTM)
    - Use intermediate precision to minimize rounding errors
    - _Requirements: 27.1, 27.2, 27.3, 27.4_
  
  - [ ]* 3.8 Write property test for conversion reversibility
    - **Property 1: Conversion Reversibility**
    - **Validates: Requirements 22.1, 22.3, 22.4, 22.5**
    - Generate random valid DD coordinates
    - Test DD→UTM→DD and DD→DMS→DD round trips
    - Assert results within precision tolerance
  
  - [ ]* 3.9 Write property test for coordinate range preservation
    - **Property 5: Coordinate Range Preservation**
    - **Validates: Requirements 2.1, 2.2, 3.1, 3.3, 3.4, 5.8, 6.7**
    - Generate random valid coordinates
    - Convert to all formats
    - Assert all results stay within valid ranges (DD: lat [-90,90], lon [-180,180]; UTM: zone [1,60], easting [100000,900000], northing [0,10000000])

- [x] 4. Checkpoint - Verify conversion engine
  - Test conversion functions manually with known coordinate pairs from design examples
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement validation service
  - [x] 5.1 Create ValidationService module with ValidationResult structure
    - Define ValidationResult class with isValid boolean and errors array
    - _Requirements: All validation requirements_
  
  - [x] 5.2 Implement DD validation function
    - Write validateDD function
    - Check latitude ∈ [-90, 90] and longitude ∈ [-180, 180]
    - Return Spanish error messages: "Latitud debe estar entre -90 y 90 grados", "Longitud debe estar entre -180 y 180 grados"
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 5.3 Implement UTM validation function
    - Write validateUTM function
    - Check zone ∈ [1, 60], hemisphere ∈ {N, S}, easting ∈ [100000, 900000], northing ∈ [0, 10000000]
    - Return Spanish error messages for each constraint
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 5.4 Implement DMS validation function
    - Write validateDMS function
    - Check degrees, minutes, seconds within proper bounds
    - Check direction ∈ {N, S} for latitude and {E, W} for longitude
    - Return Spanish error messages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ]* 5.5 Write property test for validation consistency
    - **Property 2: Validation Consistency**
    - **Validates: Requirements 28.1, 28.2, 28.3**
    - Generate random coordinates (valid and invalid)
    - Assert: if validation passes, conversion succeeds
    - Assert: if conversion succeeds, result validation passes
  
  - [ ]* 5.6 Write unit tests for validation edge cases
    - Test boundary values: -90, 90, -180, 180 for DD
    - Test invalid values: 91, -91, 181, -181
    - Test UTM boundaries and hemisphere values
    - Test DMS rollover cases

- [x] 6. Implement coordinate parsing utilities
  - [x] 6.1 Create CoordinateParser module
    - Create module for parsing coordinate strings
    - _Requirements: 9_
  
  - [x] 6.2 Implement DMS string parsing
    - Write parseDMSString function
    - Support multiple formats: "40°25'00.39\"N", "40 25 00.39 N", "40° 25' 00.39\" N"
    - Extract degrees, minutes, seconds, and direction using regex patterns
    - Throw descriptive Spanish errors for malformed strings
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 6.3 Write unit tests for DMS parsing
    - Test various input formats
    - Test malformed inputs
    - Test edge cases

- [x] 7. Implement coordinate formatting utilities
  - [x] 7.1 Create formatCoordinateString function
    - Write function to format coordinates as human-readable strings
    - DD format: "latitude°, longitude°"
    - UTM format: "zone+band hemisphere easting m northing m"
    - DMS format: "degrees°minutes'seconds\"direction"
    - Apply specified precision to output
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [x] 8. Build individual conversion UI component
  - [x] 8.1 Create main ConversionForm React component
    - Set up component state for source format, target format, input values, and result
    - Create dropdown selectors for source and target formats
    - _Requirements: 1.1, 1.4_
  
  - [x] 8.2 Implement dynamic input fields based on source format
    - Render DD input fields (latitude, longitude) when DD selected
    - Render UTM input fields (zone, hemisphere, easting, northing) when UTM selected
    - Render DMS input fields (degrees, minutes, seconds, direction for each coordinate) when DMS selected
    - _Requirements: 1.1_
  
  - [x] 8.3 Wire up validation and conversion logic to UI
    - Add "Convertir" button that triggers validation and conversion
    - Display validation errors in Spanish below input fields
    - Display conversion results when successful
    - _Requirements: 1.2, 1.3, 1.5, 28.1, 28.2, 28.3_
  
  - [ ]* 8.4 Write integration test for individual conversion workflow
    - Test complete user flow: select formats → enter values → click convert → verify result displayed
    - Test validation error display

- [x] 9. Checkpoint - Verify individual conversion UI
  - Manually test all format conversions through UI
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Excel parsing service
  - [x] 10.1 Create ExcelService module
    - Set up module structure for Excel operations
    - Import xlsx or exceljs library
    - _Requirements: 10, 15_
  
  - [x] 10.2 Implement parseExcelFile function
    - Read uploaded file using FileReader API
    - Parse Excel file using library
    - Extract headers from first row
    - Extract all data rows
    - Return ExcelData structure with headers, rows, and totalRows
    - Handle errors for corrupted or empty files with Spanish messages
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 10.3 Implement file size validation
    - Check file size before parsing
    - Reject files > 10 MB with Spanish error message
    - Display warning for files > 50,000 rows
    - _Requirements: 23.1, 23.2, 23.5_
  
  - [ ]* 10.4 Write unit tests for Excel parsing
    - Test valid Excel files
    - Test corrupted files
    - Test empty files
    - Test file size limits

- [-] 11. Implement column detection service
  - [x] 11.1 Create ColumnDetectionService module
    - Define pattern arrays for each coordinate component
    - Latitude patterns: ["lat", "latitude", "latitud", "y", "northing", "norte"]
    - Longitude patterns: ["lon", "long", "longitude", "longitud", "x", "easting", "este"]
    - UTM patterns for easting, northing, zone, hemisphere
    - _Requirements: 11, 12, 13_
  
  - [x] 11.2 Implement scoreColumnMatch helper function
    - Perform case-insensitive matching
    - Exact match → confidence 1.0
    - Contains pattern → confidence 0.8
    - Fuzzy match (Levenshtein >70% similarity) → confidence = similarity × 0.6
    - _Requirements: 11.4, 11.5, 11.6, 11.7_
  
  - [x] 11.3 Implement detectForDD function
    - Search headers for latitude and longitude columns
    - Calculate confidence scores using scoreColumnMatch
    - Return DDColumnMapping with best matches and average confidence
    - Return null for undetected columns with confidence 0
    - _Requirements: 11.1, 11.2, 11.3, 11.8, 11.9_
  
  - [x] 11.4 Implement detectForUTM function
    - Search headers for easting, northing, zone, and hemisphere columns
    - Calculate confidence based on detected columns
    - Return null for zone/hemisphere if not detected (allow fixed values)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [ ] 11.5 Implement detectForDMS function
    - Attempt to detect single-column DMS format first
    - Attempt to detect multi-column format (degrees, minutes, seconds, direction for each)
    - Return format variant and confidence score
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 11.6 Write property test for column detection determinism
    - **Property 4: Column Detection Determinism**
    - **Validates: Requirements 29.1, 29.2, 29.3**
    - Generate random header sets
    - Run detection multiple times
    - Assert identical suggestions and confidence scores

- [x] 12. Implement bulk Excel processing
  - [x] 12.1 Implement extractCoordinateFromRow function
    - Extract coordinate values from row based on column mapping
    - Handle fixed values for UTM zone/hemisphere when columns not specified
    - Throw errors if required columns are missing
    - _Requirements: 15.2, 25.3, 25.4_
  
  - [x] 12.2 Implement processExcelRows function
    - Iterate through all data rows
    - Extract coordinates using column mapping
    - Validate each coordinate
    - Convert valid coordinates to target format
    - Record errors for invalid rows and continue processing
    - Preserve all original columns in results
    - Invoke progress callback with current/total/percentage
    - Return ProcessingResult with results array and summary
    - _Requirements: 15.1, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 16.1, 16.2, 16.3_
  
  - [ ]* 12.3 Write property test for bulk processing completeness
    - **Property 3: Bulk Processing Completeness**
    - **Validates: Requirements 15.7, 15.8, 18.1, 18.2, 18.3**
    - Generate random row sets
    - Process with random configs
    - Assert LENGTH(results) = LENGTH(input rows)
    - Assert successCount + errorCount = total rows
    - Assert each row has either ERROR or COORDENADA_CONVERTIDA populated
  
  - [ ]* 12.4 Write integration test for bulk conversion with errors
    - Create test Excel file with mix of valid/invalid rows
    - Process conversion
    - Verify summary counts
    - Verify error rows have ERROR column populated

- [x] 13. Implement Excel output generation
  - [x] 13.1 Implement generateExcelFile function
    - Create new workbook with all original columns preserved
    - Add COORDENADA_ORIGINAL column with formatted source coordinates
    - Add COORDENADA_CONVERTIDA column with formatted converted coordinates
    - Add ERROR column (empty for successful rows, error message for failed rows)
    - Preserve original row order
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_
  
  - [x] 13.2 Implement file download functionality
    - Use FileSaver.js to trigger download
    - Set filename as "coordenadas_convertidas.xlsx"
    - _Requirements: 17_

- [x] 14. Build Excel bulk conversion UI
  - [x] 14.1 Create ExcelUploadForm React component
    - Implement file upload input
    - Validate file type (.xlsx, .xls) on client side
    - Call parseExcelFile on upload
    - Display file info (name, row count)
    - _Requirements: 10.1, 23.1, 23.2_
  
  - [x] 14.2 Create ColumnMappingForm component
    - Display detected column suggestions with confidence score
    - Show dropdown selectors for each required coordinate component
    - Populate dropdowns with all available headers
    - For UTM: include inputs for fixed zone/hemisphere values when columns not selected
    - Validate that all required columns/values are specified before proceeding
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 25.1, 25.2, 25.5_
  
  - [x] 14.3 Create ProcessingProgress component
    - Display progress bar showing percentage complete
    - Display "Procesando: N de total" message
    - Update in real-time during processing
    - _Requirements: 16.4, 23.3, 23.4_
  
  - [x] 14.4 Create ProcessingSummary component
    - Display total rows, successful conversions, and errors
    - Display list of error row indices and messages
    - Enable download button when processing complete
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 14.5 Wire up bulk conversion workflow
    - Connect upload → column mapping → processing → summary → download
    - Implement state management for workflow steps
    - Handle async processing to prevent UI blocking
    - _Requirements: 23.3_
  
  - [ ]* 14.6 Write integration test for complete Excel workflow
    - Upload file → detect columns → confirm → process → download
    - Verify progress updates
    - Verify summary accuracy
    - Verify output file structure

- [ ] 15. Checkpoint - Verify Excel functionality
  - Test complete Excel workflow with sample files
  - Test column detection with various header formats
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement error handling and localization
  - [ ] 16.1 Create error message constants file
    - Define all Spanish error messages as constants
    - Group by validation type (DD, UTM, DMS, Excel, Column detection)
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_
  
  - [ ] 16.2 Implement global error boundary component
    - Catch unexpected errors in React components
    - Display user-friendly Spanish message without technical details
    - _Requirements: 21.5, 28.4_
  
  - [ ]* 16.3 Write property test for error message localization
    - **Property 6: Error Message Localization**
    - **Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5**
    - Generate validation errors
    - Assert all error messages are in Spanish
    - Assert no technical stack traces in messages

- [ ] 17. Implement UI styling and design
  - [ ] 17.1 Set up UI component library
    - Choose and install Material-UI, Ant Design, or Chakra UI
    - Configure theme for modern, minimalist, eclectic aesthetic
    - _Requirements: 30_
  
  - [ ] 17.2 Style ConversionForm component
    - Apply clean, minimalist design
    - Use consistent spacing and typography
    - Add clear visual feedback for validation errors and success states
    - _Requirements: 1_
  
  - [ ] 17.3 Style Excel workflow components
    - Design professional column mapping interface
    - Style progress indicators
    - Design summary view with clear success/error visualization
    - _Requirements: 10, 14, 16, 18_
  
  - [ ] 17.4 Implement responsive design
    - Ensure application works on desktop and tablet screens
    - Test accessibility (keyboard navigation, screen reader compatibility)
    - _Requirements: 30_

- [ ] 18. Implement precision configuration
  - [ ] 18.1 Add precision controls to UI
    - Add input fields for DD precision (default 6, range 0-10)
    - Add input fields for UTM precision (default 2, range 0-10)
    - Add input fields for DMS seconds precision (default 3, range 0-10)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  
  - [ ] 18.2 Apply precision settings to all conversions
    - Pass precision config to conversion engine
    - Apply rounding in conversion algorithms
    - Apply formatting in coordinate strings
    - _Requirements: 19, 20.4_

- [ ] 19. Final integration and testing
  - [ ] 19.1 Test all conversion paths end-to-end
    - Test DD↔UTM, DD↔DMS, UTM↔DMS in both directions
    - Test with various precision settings
    - Test boundary cases and edge values
    - _Requirements: 1.4, 27_
  
  - [ ] 19.2 Test client-side processing verification
    - Verify no coordinate data sent to server
    - Verify all processing happens in browser
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_
  
  - [ ] 19.3 Performance testing for large files
    - Test with 1000+ row files
    - Test with 10,000+ row files
    - Verify UI remains responsive
    - Verify progress updates at appropriate intervals
    - _Requirements: 23.3, 23.4_
  
  - [ ]* 19.4 Write end-to-end browser tests
    - Test complete user workflows in real browser environment
    - Test file upload, processing, and download
    - Test error scenarios and recovery
  
  - [ ] 19.5 Browser compatibility testing
    - Test on Chrome 90+
    - Test on Firefox 88+
    - Test on Safari 14+
    - Test on Edge 90+
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5_

- [ ] 20. Final checkpoint - Complete application
  - Perform full application testing
  - Verify all requirements are met
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Implementation language: JavaScript (React for UI, vanilla JS for services)
- All coordinate conversions use WGS84 datum
- Client-side processing ensures data privacy (no server transmission)
- Error messages are localized in Spanish throughout
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property tests validate universal correctness properties using generated test cases
- Unit and integration tests validate specific examples and workflows
