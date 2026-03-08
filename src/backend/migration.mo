import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type ServiceType = {
    #washFold;
    #washIron;
    #dryCleaning;
    #blanketBedsheet;
    #expressLaundry;
  };

  type Booking = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
    pickupDate : Text;
    serviceType : ServiceType;
    numClothes : Nat;
    timestamp : Int;
  };

  type OldActor = {
    nextBookingId : Nat;
    bookingsMap : Map.Map<Nat, Booking>;
  };

  type NewActor = {
    nextBookingId : Nat;
    bookingsMap : Map.Map<Nat, Booking>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
