-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS postgis;

create
or replace function nearby_Stores(laat float, loong float) returns table (
  id public."Store".id % TYPE,
  name public."Store".name % TYPE,
  Logo text,
  lat text,
  long text,
  dist_KM float
) language sql as $$
select
  id,
  name,
  "Logo",
  "Store".lat,
  "Store".lng,
  st_distance(
    ST_GeomFromText(
      'POINT(' || "Store".lng || ' ' || "Store".lat || ')'
    ),
    st_point(loong, laat) :: geography
  ) / 1000 as dist_KM
from
  public."Store"
order by
  dist_KM;
$$;