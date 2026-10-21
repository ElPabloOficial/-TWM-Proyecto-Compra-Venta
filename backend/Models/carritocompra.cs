using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class carritocompra
{
    public int id { get; set; }

    public string estado { get; set; } = null!;

    public DateTime ultimaactualizacion { get; set; }

    public virtual ICollection<crear3> crear3s { get; set; } = new List<crear3>();

    public virtual ICollection<crear4> crear4s { get; set; } = new List<crear4>();
}
