DELIMITER //

CREATE PROCEDURE sp_add_kary_AhmadIvanAndrian(
    IN p_nip VARCHAR(20),
    IN p_nama VARCHAR(100),
    IN p_alamat VARCHAR(255),
    IN p_gend CHAR(1),
    IN p_tgl_lahir DATE,
    IN p_photo LONGTEXT,
    IN p_user_id INT,
    IN p_status TINYINT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        INSERT INTO log_trx_api (keterangan, status, created_at)
        VALUES (CONCAT('Gagal simpan karyawan NIP: ', p_nip), 'GAGAL', NOW());
        SELECT 'error_sql' AS status;
    END;

    START TRANSACTION;

    IF EXISTS (SELECT 1 FROM karyawan WHERE nip = p_nip) THEN
        INSERT INTO log_trx_api (keterangan, status, created_at)
        VALUES (CONCAT('Gagal simpan karyawan NIP: ', p_nip, ' (NIP sudah ada)'), 'GAGAL', NOW());
        ROLLBACK;
        SELECT 'duplicate' AS status;
    ELSE
        INSERT INTO karyawan (nip, nama, alamat, gend, tgl_lahir, photo, status, insert_by, insert_at)
        VALUES (p_nip, p_nama, p_alamat, p_gend, p_tgl_lahir, p_photo, p_status, p_user_id, NOW());

        INSERT INTO log_trx_api (keterangan, status, created_at)
        VALUES (CONCAT('Berhasil simpan karyawan NIP: ', p_nip), 'SUKSES', NOW());

        COMMIT;
        SELECT 'success' AS status;
    END IF;
END //

DELIMITER ;