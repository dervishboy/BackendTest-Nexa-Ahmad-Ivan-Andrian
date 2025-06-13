CREATE OR REPLACE VIEW karyawan_AhmadIvanAndrian AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY nip) AS No,
    nip,
    nama,
    alamat,
    CASE 
        WHEN gend = 'L' THEN 'Laki - Laki'
        WHEN gend = 'P' THEN 'Perempuan'
        ELSE 'Tidak Diketahui'
    END AS Gend,
    DATE_FORMAT(tgl_lahir, '%d %M %Y') AS `Tanggal Lahir`
FROM karyawan
WHERE status = 1;

-- CREATE VIEW karyawan_AhmadIvanAndrian AS
-- SELECT 
--     ROW_NUMBER() OVER (ORDER BY nip) AS No,
--     nip,
--     nama,
--     alamat,
--     CASE 
--         WHEN gend = 'L' THEN 'Laki - Laki'
--         WHEN gend = 'P' THEN 'Perempuan'
--     END AS Gend,
--     DATE_FORMAT(tgl_lahir, '%d %M %Y') AS `Tanggal Lahir`
-- FROM karyawan;