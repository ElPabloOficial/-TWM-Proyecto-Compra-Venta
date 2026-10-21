using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class provincium
{
    public int id { get; set; }

    public string nombre { get; set; } = null!;

    public int superficie { get; set; }

    public int id_region { get; set; }

    public virtual ICollection<comuna> comunas { get; set; } = new List<comuna>();

    public virtual region id_regionNavigation { get; set; } = null!;
}
