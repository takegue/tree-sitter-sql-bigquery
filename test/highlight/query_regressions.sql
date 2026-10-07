SELECT *, IF(TRUE, 1, 0) AS selected
--        ^ function
FROM events
FOR SYSTEM_TIME AS OF CURRENT_TIMESTAMP();
-- <- keyword
--                    ^ function

SELECT
  _PARTITIONTIME,
-- ^ variable.builtin
  _TABLE_SUFFIX,
-- ^ variable.builtin
  _pArTiTiOnTiMe,
-- ^ variable.builtin
  _TaBlE_sUfFiX
-- ^ variable.builtin
FROM events;
