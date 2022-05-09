create or replace procedure `sandbox.hoge`(
  plainarg int64
  , in inarg string
  , out outarg string
  , inout inoutarg string
)
begin
  select 1 as a;
  select @@predefined as a;
  select @query_macro as a;
end;

create procedure if not exists `sandbox.hoge2`(
  plainarg int64
  , in inarg string
  , out outarg string
  , inout inoutarg string
)
begin
  select 1 as a;
end;
