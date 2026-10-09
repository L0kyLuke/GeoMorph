# Requirements Document: GeoMorph - Coordinate Converter

## Introduction

GeoMorph is a web-based coordinate conversion application that enables users to convert geographic coordinates between Decimal Degrees (DD), UTM (Universal Transverse Mercator), and Degrees Minutes Seconds (DMS) formats. The system supports both individual coordinate conversion and bulk processing of Excel files with intelligent column detection, comprehensive validation, and localized error handling in Spanish.

## Glossary

- **System**: The GeoMorph web application
- **ConversionEngine**: Core component responsible for coordinate transformations
- **ValidationService**: Component that validates coordinate inputs
- **ExcelService**: Component that handles Excel file import/export
- **ColumnDetectionService**: Component that identifies coordinate columns in Excel files
- **User**: Person interacting with the application
- **DD**: Decimal Degrees coordinate format
- **UTM**: Universal Transverse Mercator coordinate format
- **DMS**: Degrees Minutes Seconds coordinate format
- **WGS84**: World Geodetic System 1984 datum used for all conversions
- **SourceFormat**: The coordinate format being converted from
- **TargetFormat**: The coordinate format being converted to
- **ValidationResult**: Structure containing validation status and error messages
- **ExcelFile**: Spreadsheet file in .xlsx or .xls format
- **ColumnMapping**: Configuration specifying which Excel columns contain coordinate data
- **ProcessingResult**: Output from bulk conversion containing results and summary
- **FixedValue**: User-specified constant value used when column is not available

## Requirements

### Requirement 1: Individual Coordinate Conversion

**User Story:** As a user, I want to convert individual coordinates between formats, so that I can quickly transform single location data without needing a full spreadsheet.

#### Acceptance Criteria

1. WHEN a user selects a source format (DD, UTM, or DMS), THE System SHALL display the appropriate input fields for that format
2. WHEN a user enters valid coordinate values and selects a target format, THE System SHALL convert the coordinates to the target format
3. WHEN a user enters invalid coordinate values, THE System SHALL display validation error messages in Spanish
4. THE System SHALL support bidirectional conversions between all format pairs (DD↔UTM, DD↔DMS, UTM↔DMS)
5. WHEN a conversion is successful, THE System SHALL display the result in human-readable format
6. THE System SHALL use WGS84 datum for all coordinate conversions

### Requirement 2: Decimal Degrees Validation

**User Story:** As a user, I want my DD coordinates validated, so that I receive immediate feedback on invalid inputs before attempting conversion.

#### Acceptance Criteria

1. WHEN validating DD coordinates, THE ValidationService SHALL ensure latitude is between -90 and 90 degrees
2. WHEN validating DD coordinates, THE ValidationService SHALL ensure longitude is between -180 and 180 degrees
3. WHEN DD validation fails, THE ValidationService SHALL return error messages in Spanish
4. WHEN DD coordinates are valid, THE ValidationService SHALL return isValid as true with no error messages

### Requirement 3: UTM Validation

**User Story:** As a user, I want my UTM coordinates validated, so that I can catch data entry errors before conversion.

#### Acceptance Criteria

1. WHEN validating UTM coordinates, THE ValidationService SHALL ensure zone is between 1 and 60
2. WHEN validating UTM coordinates, THE ValidationService SHALL ensure hemisphere is N or S
3. WHEN validating UTM coordinates, THE ValidationService SHALL ensure easting is between 100,000 and 900,000 meters
4. WHEN validating UTM coordinates, THE ValidationService SHALL ensure northing is between 0 and 10,000,000 meters
5. WHEN UTM validation fails, THE ValidationService SHALL return descriptive error messages in Spanish
6. WHEN UTM coordinates are valid, THE ValidationService SHALL return isValid as true with no error messages

### Requirement 4: DMS Validation

**User Story:** As a user, I want my DMS coordinates validated, so that I can ensure proper formatting before conversion.

#### Acceptance Criteria

1. WHEN validating DMS latitude, THE ValidationService SHALL ensure degrees are between 0 and 90
2. WHEN validating DMS longitude, THE ValidationService SHALL ensure degrees are between 0 and 180
3. WHEN validating DMS coordinates, THE ValidationService SHALL ensure minutes are between 0 and 59
4. WHEN validating DMS coordinates, THE ValidationService SHALL ensure seconds are between 0 and 60 (exclusive)
5. WHEN validating DMS latitude, THE ValidationService SHALL ensure direction is N or S
6. WHEN validating DMS longitude, THE ValidationService SHALL ensure direction is E or W
7. WHEN DMS validation fails, THE ValidationService SHALL return error messages in Spanish
8. WHEN DMS coordinates are valid, THE ValidationService SHALL return isValid as true with no error messages

### Requirement 5: DD to UTM Conversion

**User Story:** As a user, I want to convert DD coordinates to UTM format, so that I can use coordinates in metric projection systems.

#### Acceptance Criteria

1. WHEN converting DD to UTM, THE ConversionEngine SHALL calculate the UTM zone as FLOOR((longitude + 180) / 6) + 1
2. WHEN converting DD to UTM, THE ConversionEngine SHALL determine hemisphere as N for latitude ≥ 0 and S for latitude < 0
3. WHEN converting DD to UTM, THE ConversionEngine SHALL calculate the UTM band based on latitude
4. WHEN converting DD to UTM, THE ConversionEngine SHALL apply WGS84 ellipsoid parameters (a=6378137.0, e=0.0818191908426, k0=0.9996)
5. WHEN converting DD to UTM, THE ConversionEngine SHALL add false easting of 500,000 meters
6. WHEN converting DD to UTM with southern hemisphere, THE ConversionEngine SHALL add false northing of 10,000,000 meters
7. WHEN converting DD to UTM, THE ConversionEngine SHALL round easting and northing to the specified precision
8. WHEN DD to UTM conversion completes, THE ConversionEngine SHALL return a UTMCoordinate with valid zone, band, hemisphere, easting, and northing

### Requirement 6: UTM to DD Conversion

**User Story:** As a user, I want to convert UTM coordinates to DD format, so that I can use coordinates with standard GPS devices.

#### Acceptance Criteria

1. WHEN converting UTM to DD, THE ConversionEngine SHALL remove false easting of 500,000 meters
2. WHEN converting UTM to DD with southern hemisphere, THE ConversionEngine SHALL remove false northing of 10,000,000 meters
3. WHEN converting UTM to DD, THE ConversionEngine SHALL calculate footpoint latitude using meridional arc
4. WHEN converting UTM to DD, THE ConversionEngine SHALL apply WGS84 ellipsoid parameters
5. WHEN converting UTM to DD, THE ConversionEngine SHALL calculate the central meridian as (zone - 1) × 6 - 180 + 3
6. WHEN converting UTM to DD, THE ConversionEngine SHALL round latitude and longitude to the specified precision
7. WHEN UTM to DD conversion completes, THE ConversionEngine SHALL return a DDCoordinate with latitude between -90 and 90 and longitude between -180 and 180

### Requirement 7: DD to DMS Conversion

**User Story:** As a user, I want to convert DD coordinates to DMS format, so that I can use traditional navigation notation.

#### Acceptance Criteria

1. WHEN converting DD to DMS, THE ConversionEngine SHALL determine direction as N for positive latitude and S for negative latitude
2. WHEN converting DD to DMS, THE ConversionEngine SHALL determine direction as E for positive longitude and W for negative longitude
3. WHEN converting DD to DMS, THE ConversionEngine SHALL extract degrees as the integer part of the absolute coordinate value
4. WHEN converting DD to DMS, THE ConversionEngine SHALL calculate minutes from the decimal remainder multiplied by 60
5. WHEN converting DD to DMS, THE ConversionEngine SHALL calculate seconds from the minutes decimal remainder multiplied by 60
6. WHEN converting DD to DMS, THE ConversionEngine SHALL round seconds to the specified precision
7. WHEN seconds round to 60, THE ConversionEngine SHALL handle rollover by incrementing minutes and resetting seconds to 0
8. WHEN minutes roll over to 60, THE ConversionEngine SHALL increment degrees and reset minutes to 0
9. WHEN DD to DMS conversion completes, THE ConversionEngine SHALL return a DMSCoordinate with valid degrees, minutes, and seconds

### Requirement 8: DMS to DD Conversion

**User Story:** As a user, I want to convert DMS coordinates to DD format, so that I can use decimal notation for calculations.

#### Acceptance Criteria

1. WHEN converting DMS to DD, THE ConversionEngine SHALL calculate decimal degrees as degrees + (minutes / 60) + (seconds / 3600)
2. WHEN converting DMS to DD with S direction, THE ConversionEngine SHALL negate the latitude value
3. WHEN converting DMS to DD with W direction, THE ConversionEngine SHALL negate the longitude value
4. WHEN converting DMS to DD, THE ConversionEngine SHALL round the result to the specified precision
5. WHEN DMS to DD conversion completes, THE ConversionEngine SHALL return a DDCoordinate with latitude between -90 and 90 and longitude between -180 and 180

### Requirement 9: DMS String Parsing

**User Story:** As a user, I want to enter DMS coordinates in flexible formats, so that I can use various notation styles without strict formatting.

#### Acceptance Criteria

1. WHEN parsing a DMS string, THE CoordinateParser SHALL accept format "40°25'00.39\"N"
2. WHEN parsing a DMS string, THE CoordinateParser SHALL accept format "40 25 00.39 N"
3. WHEN parsing a DMS string, THE CoordinateParser SHALL accept format "40° 25' 00.39\" N"
4. WHEN parsing a DMS string, THE CoordinateParser SHALL extract degrees, minutes, seconds, and direction components
5. WHEN a DMS string is malformed, THE CoordinateParser SHALL throw a descriptive error message in Spanish
6. WHEN parsing completes successfully, THE CoordinateParser SHALL return a DMSComponents structure

### Requirement 10: Excel File Upload and Parsing

**User Story:** As a user, I want to upload Excel files containing coordinate data, so that I can convert large datasets efficiently.

#### Acceptance Criteria

1. WHEN a user uploads a file, THE ExcelService SHALL validate the file type is .xlsx or .xls
2. WHEN parsing an Excel file, THE ExcelService SHALL extract headers from the first row
3. WHEN parsing an Excel file, THE ExcelService SHALL extract all data rows
4. WHEN parsing an Excel file, THE ExcelService SHALL return the total row count
5. WHEN an Excel file is corrupted or invalid, THE ExcelService SHALL return an error message in Spanish
6. WHEN an Excel file is empty, THE ExcelService SHALL return an error message in Spanish

### Requirement 11: Automatic Column Detection for DD Format

**User Story:** As a user, I want the system to automatically detect latitude and longitude columns, so that I don't have to manually specify them.

#### Acceptance Criteria

1. WHEN detecting DD columns, THE ColumnDetectionService SHALL match headers against patterns ["lat", "latitude", "latitud", "y", "northing", "norte"]
2. WHEN detecting DD columns, THE ColumnDetectionService SHALL match headers against patterns ["lon", "long", "longitude", "longitud", "x", "easting", "este"]
3. WHEN detecting columns, THE ColumnDetectionService SHALL perform case-insensitive matching
4. WHEN detecting columns, THE ColumnDetectionService SHALL assign confidence scores based on match quality
5. WHEN an exact match is found, THE ColumnDetectionService SHALL assign confidence score of 1.0
6. WHEN a partial match is found, THE ColumnDetectionService SHALL assign confidence score of 0.8
7. WHEN using fuzzy matching with >70% similarity, THE ColumnDetectionService SHALL assign confidence score based on similarity × 0.6
8. WHEN no columns are detected, THE ColumnDetectionService SHALL return null for column names with confidence of 0
9. WHEN both latitude and longitude are detected, THE ColumnDetectionService SHALL return confidence as the average of both scores

### Requirement 12: Automatic Column Detection for UTM Format

**User Story:** As a user, I want the system to automatically detect UTM component columns, so that I can quickly map complex spreadsheet structures.

#### Acceptance Criteria

1. WHEN detecting UTM columns, THE ColumnDetectionService SHALL search for easting column using appropriate patterns
2. WHEN detecting UTM columns, THE ColumnDetectionService SHALL search for northing column using appropriate patterns
3. WHEN detecting UTM columns, THE ColumnDetectionService SHALL search for zone column using appropriate patterns
4. WHEN detecting UTM columns, THE ColumnDetectionService SHALL search for hemisphere column using appropriate patterns
5. WHEN UTM zone or hemisphere columns are not detected, THE ColumnDetectionService SHALL return null for those columns
6. WHEN zone or hemisphere is null, THE System SHALL allow user to specify fixed values
7. WHEN detecting UTM columns, THE ColumnDetectionService SHALL calculate confidence based on detected columns

### Requirement 13: Automatic Column Detection for DMS Format

**User Story:** As a user, I want the system to detect DMS columns whether they're in single-column or multi-column format, so that I can handle various spreadsheet layouts.

#### Acceptance Criteria

1. WHEN detecting DMS columns, THE ColumnDetectionService SHALL attempt to detect single-column format first
2. WHEN detecting DMS columns, THE ColumnDetectionService SHALL attempt to detect multi-column format (degrees, minutes, seconds, direction for each coordinate)
3. WHEN DMS detection succeeds, THE ColumnDetectionService SHALL return the detected format variant
4. WHEN DMS detection succeeds, THE ColumnDetectionService SHALL return confidence score based on match quality

### Requirement 14: Manual Column Selection

**User Story:** As a user, I want to manually select columns when automatic detection fails, so that I can still process files with non-standard headers.

#### Acceptance Criteria

1. WHEN automatic detection returns confidence < 1.0, THE System SHALL display dropdown selectors for manual column selection
2. WHEN displaying column selectors, THE System SHALL populate dropdowns with all available header names
3. WHEN user selects columns manually, THE System SHALL validate that all required columns are selected before processing
4. WHEN required columns are missing, THE System SHALL display an error message in Spanish listing the missing columns

### Requirement 15: Bulk Excel Processing

**User Story:** As a user, I want to process all rows in my Excel file, so that I can convert hundreds or thousands of coordinates at once.

#### Acceptance Criteria

1. WHEN processing Excel rows, THE ExcelService SHALL iterate through all data rows
2. WHEN processing a row, THE ExcelService SHALL extract coordinates based on column mapping
3. WHEN processing a row, THE ExcelService SHALL validate extracted coordinates
4. WHEN a row has valid coordinates, THE ExcelService SHALL convert them to the target format
5. WHEN a row has invalid coordinates, THE ExcelService SHALL record the error and continue processing remaining rows
6. WHEN processing rows, THE ExcelService SHALL preserve all original columns in the output
7. WHEN processing completes, THE ExcelService SHALL return exactly the same number of result rows as input rows
8. WHEN processing completes, THE ExcelService SHALL ensure successCount + errorCount equals total row count

### Requirement 16: Progress Reporting During Bulk Processing

**User Story:** As a user, I want to see progress while my file is being processed, so that I know the system is working and how long it will take.

#### Acceptance Criteria

1. WHEN processing Excel rows, THE ExcelService SHALL invoke the progress callback with current row number
2. WHEN processing Excel rows, THE ExcelService SHALL invoke the progress callback with total row count
3. WHEN processing Excel rows, THE ExcelService SHALL invoke the progress callback with percentage complete
4. WHEN progress callback is provided, THE System SHALL update the UI progress indicator

### Requirement 17: Excel Output Generation

**User Story:** As a user, I want to download results in Excel format with original data preserved, so that I can review conversions alongside the source data.

#### Acceptance Criteria

1. WHEN generating output Excel, THE ExcelService SHALL include all original columns
2. WHEN generating output Excel, THE ExcelService SHALL add a COORDENADA_ORIGINAL column containing the formatted source coordinates
3. WHEN generating output Excel, THE ExcelService SHALL add a COORDENADA_CONVERTIDA column containing the formatted converted coordinates
4. WHEN generating output Excel, THE ExcelService SHALL add an ERROR column containing error messages (empty for successful rows)
5. WHEN a row conversion was successful, THE ExcelService SHALL populate COORDENADA_CONVERTIDA and leave ERROR empty
6. WHEN a row conversion failed, THE ExcelService SHALL populate ERROR and leave COORDENADA_CONVERTIDA empty
7. WHEN generating output Excel, THE ExcelService SHALL preserve original row order

### Requirement 18: Processing Summary

**User Story:** As a user, I want to see a summary after bulk processing completes, so that I can quickly understand success rate and identify problems.

#### Acceptance Criteria

1. WHEN bulk processing completes, THE System SHALL display total number of rows processed
2. WHEN bulk processing completes, THE System SHALL display number of successful conversions
3. WHEN bulk processing completes, THE System SHALL display number of errors
4. WHEN errors occurred, THE System SHALL display a list of error row indices and messages
5. WHEN processing summary is displayed, THE System SHALL enable the download button for the output file

### Requirement 19: Conversion Precision Configuration

**User Story:** As a user, I want to specify precision for converted coordinates, so that I can control the level of detail in my results.

#### Acceptance Criteria

1. WHEN converting to DD format, THE System SHALL apply precision to decimal places
2. WHEN converting to UTM format, THE System SHALL apply precision to easting and northing decimal places
3. WHEN converting to DMS format, THE System SHALL apply precision to seconds decimal places
4. THE System SHALL use default precision of 6 for DD, 2 for UTM, and 3 for DMS seconds
5. THE System SHALL allow precision values between 0 and 10

### Requirement 20: Coordinate Format Strings

**User Story:** As a user, I want converted coordinates displayed in standard, readable formats, so that I can easily interpret and use the results.

#### Acceptance Criteria

1. WHEN formatting DD coordinates, THE System SHALL display as "latitude°, longitude°"
2. WHEN formatting UTM coordinates, THE System SHALL display as "zone+band hemisphere easting m northing m"
3. WHEN formatting DMS coordinates, THE System SHALL display as "degrees°minutes'seconds\"direction"
4. WHEN formatting coordinates, THE System SHALL apply the specified precision

### Requirement 21: Error Message Localization

**User Story:** As a Spanish-speaking user, I want all error messages in Spanish, so that I can understand problems without language barriers.

#### Acceptance Criteria

1. WHEN validation fails, THE System SHALL display error messages in Spanish
2. WHEN file parsing fails, THE System SHALL display error messages in Spanish
3. WHEN column detection fails, THE System SHALL display warning messages in Spanish
4. WHEN row processing fails, THE System SHALL record error messages in Spanish
5. THE System SHALL NOT display technical stack traces or English error messages to users

### Requirement 22: Conversion Round-Trip Accuracy

**User Story:** As a user, I want conversions to be reversible within precision limits, so that I can trust the mathematical accuracy of the transformations.

#### Acceptance Criteria

1. WHEN converting a coordinate from format A to format B and back to format A, THE System SHALL produce a result within precision tolerance
2. THE System SHALL define precision tolerance based on the configured decimal places
3. WHEN testing round-trip conversion, THE System SHALL verify DD→UTM→DD maintains accuracy
4. WHEN testing round-trip conversion, THE System SHALL verify DD→DMS→DD maintains accuracy
5. WHEN testing round-trip conversion, THE System SHALL verify UTM→DD→UTM maintains accuracy (for the same zone and hemisphere)

### Requirement 23: File Size and Performance Limits

**User Story:** As a user, I want the system to handle reasonably large files efficiently, so that I can process typical professional datasets without performance issues.

#### Acceptance Criteria

1. THE System SHALL accept Excel files up to 10 MB in size
2. WHEN a file exceeds the size limit, THE System SHALL display an error message in Spanish
3. WHEN processing more than 1000 rows, THE System SHALL use asynchronous processing to prevent UI blocking
4. WHEN processing rows, THE System SHALL update progress at intervals rather than every single row
5. THE System SHALL warn users when files exceed 50,000 rows

### Requirement 24: Client-Side Processing

**User Story:** As a user concerned about privacy, I want my coordinate data processed locally in my browser, so that sensitive location information doesn't leave my device.

#### Acceptance Criteria

1. THE System SHALL perform all coordinate conversions in the client browser
2. THE System SHALL perform all Excel parsing and generation in the client browser
3. THE System SHALL NOT transmit coordinate data to any server
4. THE System SHALL NOT store uploaded Excel files on any server
5. THE System SHALL NOT log coordinate values to any server

### Requirement 25: Fixed Value Support for UTM Conversion

**User Story:** As a user with Excel files that don't include zone or hemisphere columns, I want to specify fixed values, so that I can still process my data.

#### Acceptance Criteria

1. WHEN zone column is not selected, THE System SHALL allow user to specify a fixed zone value
2. WHEN hemisphere column is not selected, THE System SHALL allow user to specify a fixed hemisphere value
3. WHEN using fixed zone value, THE System SHALL apply the same zone to all rows
4. WHEN using fixed hemisphere value, THE System SHALL apply the same hemisphere to all rows
5. WHEN fixed values are provided, THE System SHALL validate they are within acceptable ranges before processing

### Requirement 26: UTM Band Calculation

**User Story:** As a user converting to UTM format, I want the system to automatically calculate the correct UTM band, so that I get complete UTM coordinates.

#### Acceptance Criteria

1. WHEN calculating UTM band for latitude between -80 and 72, THE ConversionEngine SHALL use 8-degree bands starting at -80
2. WHEN calculating UTM band for latitude between 72 and 84, THE ConversionEngine SHALL use band X (Svalbard exception)
3. WHEN latitude is outside the range -80 to 84, THE ConversionEngine SHALL throw an error
4. THE ConversionEngine SHALL use band letters ['C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X']

### Requirement 27: Coordinate Conversion Chaining

**User Story:** As a developer, I want to convert between any two formats including indirect conversions, so that the system supports all possible format pairs.

#### Acceptance Criteria

1. WHEN converting UTM to DMS, THE ConversionEngine SHALL convert UTM→DD→DMS
2. WHEN converting DMS to UTM, THE ConversionEngine SHALL convert DMS→DD→UTM
3. WHEN chaining conversions, THE System SHALL use intermediate precision to minimize rounding errors
4. WHEN chaining conversions completes, THE System SHALL return coordinates in the target format

### Requirement 28: Validation Before Conversion

**User Story:** As a user, I want coordinates validated before conversion attempts, so that I get clear error messages rather than conversion failures.

#### Acceptance Criteria

1. WHEN user clicks convert button, THE System SHALL validate inputs before attempting conversion
2. WHEN validation fails, THE System SHALL display validation errors without attempting conversion
3. WHEN validation succeeds, THE System SHALL proceed with conversion
4. WHEN validation succeeds but conversion fails unexpectedly, THE System SHALL log the error and display a generic error message in Spanish

### Requirement 29: Column Detection Determinism

**User Story:** As a user, I want column detection to be consistent, so that I get the same suggestions every time I upload the same file.

#### Acceptance Criteria

1. WHEN detecting columns for the same headers, THE ColumnDetectionService SHALL return identical suggestions
2. WHEN detecting columns for the same headers, THE ColumnDetectionService SHALL return identical confidence scores
3. THE ColumnDetectionService SHALL NOT use randomization or non-deterministic algorithms

### Requirement 30: Browser Compatibility

**User Story:** As a user, I want the application to work on modern browsers, so that I can use it on my preferred platform.

#### Acceptance Criteria

1. THE System SHALL support Chrome version 90 and above
2. THE System SHALL support Firefox version 88 and above
3. THE System SHALL support Safari version 14 and above
4. THE System SHALL support Edge version 90 and above
5. THE System SHALL require File API support (FileReader, Blob)
6. WHERE Web Workers are available, THE System SHALL use them for processing large files
