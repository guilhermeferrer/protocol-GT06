CREATE OR REPLACE FUNCTION public.checkignitionandelectricity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    DECLARE
        result record;
    BEGIN
        if NEW.electricity IS NULL then
            select electricity, ignition from positions where imei = NEW.imei into result;
            if result IS NULL THEN
                NEW.ignition = false;
                NEW.electricity = false;
            end if;
            NEW.ignition = result.ignition;
            NEW.electricity = result.electricity;
        end if;
        RETURN NEW;
    END;
$function$

CREATE TRIGGER checkIgnitionAndElectricity
BEFORE INSERT ON positions
FOR EACH ROW
EXECUTE PROCEDURE checkIgnitionAndElectricity();