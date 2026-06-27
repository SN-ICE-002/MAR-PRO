-- Add common 18 Pacific Island Countries and Territories
INSERT INTO countries (name, code, center_lat, center_lng, zoom_level, bbox) VALUES
('Kiribati', 'KIR', -3.37, 168.73, 5, '{"minLat": -11.5, "maxLat": 5, "minLng": 168, "maxLng": 177}'),
('Marshall Islands', 'MHL', 7.13, 171.18, 5, '{"minLat": 4, "maxLat": 16, "minLng": 160, "maxLng": 175}'),
('Nauru', 'NRU', -0.52, 166.93, 13, '{"minLat": -0.6, "maxLat": -0.4, "minLng": 166.8, "maxLng": 167.0}'),
('Palau', 'PLW', 7.51, 134.58, 8, '{"minLat": 3, "maxLat": 10, "minLng": 130, "maxLng": 140}'),
('Papua New Guinea', 'PNG', -6.31, 143.95, 6, '{"minLat": -12, "maxLat": 2, "minLng": 140, "maxLng": 160}'),
('Tuvalu', 'TUV', -7.10, 177.64, 7, '{"minLat": -11, "maxLat": -5, "minLng": 176, "maxLng": 181}'),
('Micronesia', 'FSM', 6.91, 158.18, 6, '{"minLat": 0, "maxLat": 10, "minLng": 135, "maxLng": 165}'),
('Cook Islands', 'COK', -21.23, -159.77, 5, '{"minLat": -25, "maxLat": -8, "minLng": -168, "maxLng": -155}'),
('Niue', 'NIU', -19.05, -169.86, 10, '{"minLat": -20, "maxLat": -18, "minLng": -171, "maxLng": -168}'),
('New Caledonia', 'NCL', -20.90, 165.61, 7, '{"minLat": -23, "maxLat": -18, "minLng": 163, "maxLng": 168}'),
('French Polynesia', 'PYF', -17.67, -149.40, 5, '{"minLat": -28, "maxLat": -7, "minLng": -155, "maxLng": -134}'),
('American Samoa', 'ASM', -14.27, -170.13, 10, '{"minLat": -15, "maxLat": -11, "minLng": -173, "maxLng": -168}'),
('Guam', 'GUM', 13.44, 144.79, 10, '{"minLat": 12, "maxLat": 15, "minLng": 144, "maxLng": 146}')
ON CONFLICT (code) DO NOTHING;
