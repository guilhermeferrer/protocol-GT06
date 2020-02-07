CREATE OR REPLACE FUNCTION updateLastPosition() RETURNS TRIGGER AS $$
    DECLARE
        result int;
    BEGIN
        update last_positions set latitude = NEW.latitude, longitude = NEW.longitude, ignition = NEW.ignition, electricity = NEW.electricity, gps_date = NEW.gps_date, velocity = NEW.velocity, updated_at = NEW.updated_at where imei = NEW.imei;
        GET DIAGNOSTICS result = ROW_COUNT;
        if result = 0 then
            insert into last_positions(imei, latitude, longitude, velocity, gps_date, ignition, electricity, created_at, updated_at) values(New.imei, NEW.latitude, NEW.longitude, NEW.velocity, NEW.gps_date, NEW.ignition, NEW.electricity, NEW.created_at, NEW.updated_at);
        end if;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updateLastPosition
AFTER INSERT ON positions
FOR EACH ROW
EXECUTE PROCEDURE updateLastPosition();