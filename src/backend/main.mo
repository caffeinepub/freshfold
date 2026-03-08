import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";



actor {
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

  stable var nextBookingId : Nat = 0;
  stable var bookingsMap = Map.empty<Nat, Booking>();

  public shared ({ caller }) func submitBooking(
    name : Text,
    phone : Text,
    address : Text,
    pickupDate : Text,
    serviceType : ServiceType,
    numClothes : Nat,
  ) : async Nat {
    let id = nextBookingId;
    let booking : Booking = {
      id;
      name;
      phone;
      address;
      pickupDate;
      serviceType;
      numClothes;
      timestamp = Time.now();
    };

    bookingsMap.add(id, booking);
    nextBookingId += 1;
    id;
  };

  public query ({ caller }) func getBooking(id : Nat) : async ?Booking {
    bookingsMap.get(id);
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    bookingsMap.values().toArray();
  };

  public query ({ caller }) func getAdminBookings(password : Text) : async ?[Booking] {
    if (Text.equal(password, "freshfold2024")) {
      ?bookingsMap.values().toArray();
    } else {
      null;
    };
  };
};
